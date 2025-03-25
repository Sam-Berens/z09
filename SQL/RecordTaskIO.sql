DELIMITER $$
CREATE PROCEDURE RecordTaskIO(
	IN In_AttemptId TEXT,
	IN In_SubjectId TEXT,
	IN In_SessionId INT,
	IN In_SequenceId TEXT,
	IN In_TrialId INT,
	IN In_Run TEXT,
	IN In_AttemptNum INT,
	IN In_FieldIdx_C INT,
	IN In_FieldIdx_R INT,
	IN In_Correct BOOLEAN,
	IN In_RT INT,
	IN In_DateTime_Write DATETIME
)
BEGIN
IF (SELECT COUNT(AttemptId) FROM TaskIO WHERE AttemptId=In_AttemptId)=0 THEN 
	INSERT INTO TaskIO (
		AttemptId,
		SubjectId,
		SessionId,
		SequenceId,
		TrialId,
		Run,
		AttemptNum,
		FieldIdx_C,
		FieldIdx_R,
		Correct,
		RT,
		DateTime_Write
		) VALUES (
		In_AttemptId,
		In_SubjectId,
		In_SessionId,
		In_SequenceId,
		In_TrialId,
		In_Run,
		In_AttemptNum,
		In_FieldIdx_C,
		In_FieldIdx_R,
		In_Correct,
		In_RT,
		In_DateTime_Write);
END IF;
END$$
DELIMITER ;