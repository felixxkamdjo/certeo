namespace Certeo.Api.Common;

// Identity
public enum RoleName
{
    SUPER_ADMIN,
    ADMIN,
    TRAINER,
    RECEPTIONIST
}

// Master Data / References
public enum ReferenceType
{
    CATEGORY,           // training category
    GENDER,
    EDUCATION_LEVEL,
    ATTENDANCE_REASON,
    AGE_GROUP,
    VISITOR_PROFILE,     // student, professional, visitor, etc.
    ODC_DISCOVERY_SOURCE  // source of knowledge about the training center
}

// Trainings
public enum TrainingMode
{
    IN_PERSON,
    ONLINE,
    HYBRID
}

public enum TrainingStatus
{
    DRAFT,
    PUBLISHED,
    IN_PROGRESS,
    COMPLETED,
    ARCHIVED
}

public enum StandardApplicationField
{
    FULL_NAME,
    EMAIL,
    PHONE,
    LINKEDIN_URL,
    CV
}

public enum TrainingQuestionType
{
    SHORT_TEXT,
    LONG_TEXT,
    SINGLE_CHOICE,
    MULTIPLE_CHOICE,
    DROPDOWN
}

// Applications
public enum ApplicationStatus
{
    PENDING,
    IN_INTERVIEW,
    EVALUATED,
    SELECTED,
    REJECTED
}

// Participants
public enum ParticipantStatus
{
    ACTIVE,
    ON_HOLD,
    COMPLETED
}

public enum Gender
{
    MALE,
    FEMALE
}

// Evaluation
public enum EvaluationType
{
    MCQ
}

// Emails
public enum EmailTemplateType
{
    INVITATION,
    CONFIRMATION,
    CERTIFICATION,
    PASSWORD_RESET,
    NEW_APPLICATION,
    TRAINING_REMINDER
}