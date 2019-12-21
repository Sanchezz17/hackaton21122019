async function submit(userName, teacherName, lessonName, isReply) {
    if (isReply) {
        await fetch(`/api/answer/${teacherName}/${lessonName}/${fullName}`);
    } else {
        await fetch(`/api/question/${teacherName}/${lessonName}/${fullName}`);
    }
}
