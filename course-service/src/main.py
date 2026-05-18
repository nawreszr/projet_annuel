from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, Text, Boolean, ForeignKey, DateTime, UniqueConstraint, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
import os
import time
import traceback

# On se connecte à la DB principale learning_db
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://admin:postgres123@postgres:5432/learning_db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Course(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(Text)
    price = Column(Float)
    instructor = Column(String)
    instructor_id = Column(String)
    category = Column(String)
    level = Column(String)
    duration = Column(Integer)
    is_published = Column(Boolean, default=True)
    video_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Lesson(Base):
    __tablename__ = "lessons"
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"))
    title = Column(String)
    content = Column(Text)
    video_url = Column(String)
    duration = Column(Integer)
    order = Column(Integer)

class Enrollment(Base):
    __tablename__ = "enrollments"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"))
    enrolled_at = Column(DateTime, default=datetime.utcnow)
    __table_args__ = (UniqueConstraint('user_id', 'course_id', name='_user_course_uc'),)

class UserProgress(Base):
    __tablename__ = "user_progress"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"))
    lesson_id = Column(Integer, ForeignKey("lessons.id"))
    completed_at = Column(DateTime, default=datetime.utcnow)
    __table_args__ = (UniqueConstraint('user_id', 'lesson_id', name='_user_lesson_uc'),)

# On force la création des tables au démarrage
try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE courses ADD COLUMN IF NOT EXISTS video_url VARCHAR(255);"))
        conn.commit()
    print("Database columns migrated successfully")
except Exception as migration_error:
    print(f"Migration error or column already exists: {migration_error}")

try:
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully")
except Exception as e:
    print(f"Error creating tables: {e}")

app = FastAPI()

# Middleware pour voir les erreurs détaillées dans le navigateur
@app.middleware("http")
async def catch_exceptions_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as exc:
        return JSONResponse(
            status_code=500,
            content={"detail": str(exc), "traceback": traceback.format_exc()},
        )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/api/courses")
def get_courses(instructor_id: str = None, user_id: str = None, enrolled_only: bool = False, db: Session = Depends(get_db)):
    try:
        query = db.query(Course)
        
        # Filtrage par instructeur
        if instructor_id:
            query = query.filter(Course.instructor_id == instructor_id)
        
        # Récupération des IDs des cours où l'utilisateur est inscrit
        user_enrollments = []
        if user_id:
            user_enrollments = [e.course_id for e in db.query(Enrollment).filter(Enrollment.user_id == user_id).all()]
        
        # Si on veut uniquement les cours inscrits
        if enrolled_only and user_id:
            query = query.filter(Course.id.in_(user_enrollments))

        courses = query.all()
        results = []
        
        for course in courses:
            lessons_count = db.query(Lesson).filter(Lesson.course_id == course.id).count()
            
            # Calcul de la progression réelle si user_id est fourni
            progress_percentage = 0
            if user_id and lessons_count > 0:
                completed_count = db.query(UserProgress).filter(
                    UserProgress.user_id == user_id, 
                    UserProgress.course_id == course.id
                ).count()
                progress_percentage = round((completed_count / lessons_count) * 100)

            course_data = {
                "id": course.id,
                "title": course.title,
                "description": course.description,
                "price": course.price,
                "instructor": course.instructor,
                "instructor_id": course.instructor_id,
                "category": course.category,
                "level": course.level,
                "duration": course.duration,
                "is_published": course.is_published,
                "video_url": course.video_url,
                "lessons_count": lessons_count,
                "is_enrolled": course.id in user_enrollments,
                "progress_percentage": progress_percentage
            }
            results.append(course_data)
            
        return {"courses": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/courses/{course_id}")
def get_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    lessons_count = db.query(Lesson).filter(Lesson.course_id == course.id).count()
    
    return {
        "id": course.id,
        "title": course.title,
        "description": course.description,
        "price": course.price,
        "instructor": course.instructor,
        "instructor_id": course.instructor_id,
        "category": course.category,
        "level": course.level,
        "duration": course.duration,
        "is_published": course.is_published,
        "video_url": course.video_url,
        "lessons_count": lessons_count
    }

@app.post("/api/enroll")
def enroll_in_course(enroll_data: dict, db: Session = Depends(get_db)):
    try:
        user_id = enroll_data.get("user_id")
        course_id = enroll_data.get("course_id")
        
        # Check if already enrolled
        existing = db.query(Enrollment).filter(Enrollment.user_id == user_id, Enrollment.course_id == course_id).first()
        if existing:
            return {"message": "Already enrolled", "enrollment_id": existing.id}
            
        db_enroll = Enrollment(user_id=user_id, course_id=course_id)
        db.add(db_enroll)
        db.commit()
        db.refresh(db_enroll)
        return {"message": "Enrolled successfully", "enrollment_id": db_enroll.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/progress")
def update_progress(progress_data: dict, db: Session = Depends(get_db)):
    try:
        user_id = progress_data.get("user_id")
        course_id = progress_data.get("course_id")
        lesson_id = progress_data.get("lesson_id")
        
        # Check if already marked as completed
        existing = db.query(UserProgress).filter(
            UserProgress.user_id == user_id, 
            UserProgress.lesson_id == lesson_id
        ).first()
        
        if existing:
            return {"message": "Progress already saved"}
            
        db_progress = UserProgress(user_id=user_id, course_id=course_id, lesson_id=lesson_id)
        db.add(db_progress)
        db.commit()
        return {"message": "Progress updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/courses")
def create_course(course_data: dict, db: Session = Depends(get_db)):
    db_course = Course(
        title=course_data.get("title"),
        description=course_data.get("description"),
        price=float(course_data.get("price", 0)),
        instructor=course_data.get("instructor"),
        instructor_id=course_data.get("instructor_id"),
        category=course_data.get("category"),
        level=course_data.get("level"),
        duration=int(course_data.get("duration", 0)),
        video_url=course_data.get("video_url")
    )
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

@app.get("/api/courses/{course_id}/lessons")
def get_lessons(course_id: int, user_id: str = None, db: Session = Depends(get_db)):
    lessons = db.query(Lesson).filter(Lesson.course_id == course_id).order_by(Lesson.order).all()
    
    # Get completed lesson IDs if user_id is provided
    completed_ids = []
    if user_id:
        completed_ids = [p.lesson_id for p in db.query(UserProgress).filter(UserProgress.user_id == user_id, UserProgress.course_id == course_id).all()]
        
    results = []
    for lesson in lessons:
        results.append({
            "id": lesson.id,
            "course_id": lesson.course_id,
            "title": lesson.title,
            "content": lesson.content,
            "video_url": lesson.video_url,
            "duration": lesson.duration,
            "order": lesson.order,
            "is_completed": lesson.id in completed_ids
        })
        
    return {"lessons": results}

@app.post("/api/courses/{course_id}/lessons")
def add_lesson(course_id: int, lesson_data: dict, db: Session = Depends(get_db)):
    db_lesson = Lesson(
        course_id=course_id,
        title=lesson_data.get("title"),
        content=lesson_data.get("content"),
        video_url=lesson_data.get("video_url"),
        duration=lesson_data.get("duration"),
        order=lesson_data.get("order")
    )
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    return db_lesson

@app.put("/api/courses/{course_id}")
def update_course(course_id: int, course_data: dict, db: Session = Depends(get_db)):
    db_course = db.query(Course).filter(Course.id == course_id).first()
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if "title" in course_data:
        db_course.title = course_data["title"]
    if "description" in course_data:
        db_course.description = course_data["description"]
    if "price" in course_data:
        db_course.price = float(course_data["price"])
    if "category" in course_data:
        db_course.category = course_data["category"]
    if "level" in course_data:
        db_course.level = course_data["level"]
    if "duration" in course_data:
        db_course.duration = int(course_data["duration"])
    if "is_published" in course_data:
        db_course.is_published = bool(course_data["is_published"])
    if "video_url" in course_data:
        db_course.video_url = course_data["video_url"]
        
    db.commit()
    db.refresh(db_course)
    return db_course

@app.delete("/api/courses/{course_id}")
def delete_course(course_id: int, db: Session = Depends(get_db)):
    db_course = db.query(Course).filter(Course.id == course_id).first()
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    try:
        # Delete dependent data
        db.query(UserProgress).filter(UserProgress.course_id == course_id).delete()
        db.query(Enrollment).filter(Enrollment.course_id == course_id).delete()
        db.query(Lesson).filter(Lesson.course_id == course_id).delete()
        
        # Delete the course itself
        db.delete(db_course)
        db.commit()
        return {"message": "Course deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/enrollments/instructor/{instructor_id}")
def get_instructor_enrollments(instructor_id: str, db: Session = Depends(get_db)):
    try:
        # Join Course and Enrollment to find students enrolled in the instructor's courses
        enrollments = db.query(Enrollment, Course).join(
            Course, Enrollment.course_id == Course.id
        ).filter(
            Course.instructor_id == instructor_id
        ).all()
        
        results = []
        for enrollment, course in enrollments:
            results.append({
                "enrollment_id": enrollment.id,
                "user_id": enrollment.user_id,
                "enrolled_at": enrollment.enrolled_at.isoformat() if enrollment.enrolled_at else None,
                "course_id": course.id,
                "course_title": course.title,
                "course_category": course.category
            })
            
        return {"enrollments": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

