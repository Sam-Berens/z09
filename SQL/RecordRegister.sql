DELIMITER $$
CREATE PROCEDURE RecordRegister(
	IN In_SubjectId TEXT,
	IN In_SeqAFirst BOOLEAN,
	IN In_ImgAFirst BOOLEAN,
	IN In_ImgPermA TEXT,
	IN In_ImgPermB TEXT
) BEGIN IF (
	SELECT
		COUNT(SubjectId)
	FROM
		Register
	WHERE
		SubjectId = In_SubjectId
) = 0 THEN 
INSERT INTO
	Register (
		SubjectId,
		SeqAFirst,
		ImgAFirst,
		ImgPermA,
		ImgPermB
	)
VALUES
	(
		In_SubjectId,
		In_SeqAFirst,
		In_ImgAFirst,
		In_ImgPermA,
		In_ImgPermB
	);
ELSE
UPDATE
	Register
SET
	SeqAFirst = In_SeqAFirst,
	ImgAFirst = In_ImgAFirst,
	ImgPermA = In_ImgPermA,
	ImgPermB = In_ImgPermB
WHERE
	SubjectId = In_SubjectId;
END IF;
END$$
DELIMITER ;