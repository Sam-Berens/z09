// Helper function: Xor
function Xor(a, b) {
	return (a || b) && !(a && b);
}

// Helper function: Sleep
function Sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to convert FieldIdx to filenames
function FieldIdx2ImgName(FieldIdx) {
	var ImgName = './Imgs/i' + ImgPerm[FieldIdx].toString().padStart(2, '0') + '.png';
	return ImgName;
}

// OnMouseOver and OnMouseOut functions
function OnMouseOver(Img) {
	Img.width = ImgSize - 4;
}
function OnMouseOut(Img) {
	Img.width = ImgSize;
}

// Function to construct the ArrayOfResponseTags
function GetArrayOfResponseTags() {
	var AORT = [];
	for (var FieldIdx = 0; FieldIdx < FieldSize; FieldIdx++) {
		var ImgName = FieldIdx2ImgName(FieldIdx);
		var ResponseTag =
			'<img src="' + ImgName +
			'" width=' + ImgSize.toString() + 'px;' +
			' id="Resp_' + FieldIdx.toString().padStart(2, '0') +
			'" onclick="javascript:ImgClicked(this.id)"' +
			' onmouseover="OnMouseOver(this);"' +
			' onmouseout="OnMouseOut(this);">';
		AORT.push(ResponseTag);
	}
	return AORT;
}

// This function is called in the Response trial object stimulus function
function GetSparkOptions() {
	// Get the shuffled array and turn into string:
	var HtmlString = Shuffle(ArrayOfResponseTags).toString();
	// Add the table header:
	HtmlString = '<table style="text-align:center;"> <tbody><tr> <td colspan="3" align="center"> <table><tr><td>' + HtmlString;

	// Replace the 1st comma with a column separator (top row, between 1st and 2nd image):
	HtmlString = HtmlString.replace(',', '</td><td>');

	// Replace the 2nd comma with a column separator (top row, between 2nd and 3rd image):
	HtmlString = HtmlString.replace(',', '</td><td>');

	// Replace the 3rd comma with a column, row, and table separator (end of top row, start of 2nd):
	HtmlString = HtmlString.replace(',', '</td></tr></table><tr><td>');

	// Replace the 4th comma with a column separator (bottom row, between 1st and 2nd image):
	HtmlString = HtmlString.replace(',', '</td><td>');

	// Replace the 5th comma with a column separator (bottom row, between 2nd and 3rd image):
	HtmlString = HtmlString.replace(',', '</td><td>');

	// Close the table:
	HtmlString = HtmlString + '</td></tr></tbody></table>';
	return HtmlString;
}

// Give all but one of the FieldIdxs a black boarder
function BlackenBoarders(FIdxR) {
	// Identify the FieldIdxs to turn black:
	var Idxs = Array.from(Array(FieldSize).keys());
	Idxs = Idxs.filter(function (x) {
		if (x !== FIdxR) {
			return true;
		} else {
			return false;
		}
	});
	// Loop over those FieldIdxs:
	for (var i = 0; i < Idxs.length; i++) {
		var Ids2change = 'Resp_' + Idxs[i].toString().padStart(2, '0');
		document.getElementById(Ids2change).style = "border: 2px solid #000000;border-radius: 25px;" +
			"width:" + (ImgSize - 4).toString() + "px;";
	}
}

// The ImagClicked function is called when an image in the response table is clicked ...
// ... This functionality is specified in the GetArrayOfResponseTags() function
async function ImgClicked(Id) {

	// If we are not accepting responses, return the function i.e., don't do anything further)
	if (!AcceptResponse) { return; }

	// Increment the attempt number:
	AttemptNum = AttemptNum + 1;

	// Specify the TrialType, FieldId, Correct, and RT variables
	var FieldIdx_Response = parseInt(Id.slice(-2));
	var Correct = FieldIdx_Response === NextStim;
	var RT = jsPsych.getTotalTime() - StartTime_ResponsePrompt;

	// Save the data:
	var DataToSend = {};
	DataToSend.SubjectId = SubjectId;
	DataToSend.SessionId = SessionId;
	DataToSend.SequenceId = SequenceId;
	DataToSend.TrialId = TrialId;
	DataToSend.Run = JSON.stringify(CurrentRun.slice(0,CurrentRun.length-1));
	DataToSend.AttemptNum = AttemptNum;
	DataToSend.FieldIdx_C = NextStim;
	DataToSend.FieldIdx_R = FieldIdx_Response;
	if (Correct) {
		DataToSend.Correct = 1;
	} else {
		DataToSend.Correct = 0;
	}
	DataToSend.RT = RT;

	//Send data to php script
	fetch('./WriteTaskIO.php', {
		method: 'post',
		headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
		body: JSON.stringify(DataToSend)
	});

	// Colour the boarders and end the trial (if we need to):
	if (!Correct) {
		document.getElementById(Id).style = "border: 2px solid #ff0000;border-radius: 25px;" +
			"width:" + (ImgSize - 4).toString() + "px;";

	} else {
		// Set AcceptResponse to be false:
		AcceptResponse = false;

		// Set the current (correct) response to have a green border:
		document.getElementById(Id).style = "border: 2px solid #00ff00;border-radius: 25px;" +
			"width:" + (ImgSize - 4).toString() + "px;";

		// Set all other responses to have a black border:
		BlackenBoarders(FieldIdx_Response);

		// Sleep for 4 second:
		await Sleep(4000);

		// End the trial:
		jsPsych.finishTrial();
	}
}

// Called at the very end of the Promise chain to run jsPsych
function RunTrialLoop() {
	var TrialLoop = {
		timeline: [PreTrialOps, RunLoop, ResponsePrompt],
		loop_function: function () {
			return TrialId < (Trials.length - 1);
		}
	};
	jsPsych.run([PreloadImgs, EnterFullscreen, SetTrials, TrialLoop, Interlude, SetTrials, TrialLoop, ExitFullscreen, EndOfTask]);
}

// Specify the Promise chain
async function PromiseChain() {

	// Set the ImgSize and get the ArrayOfResponseTags
	var ScreenHeight = window.screen.height;
	var ScreenWidth = window.screen.width;
	if (ScreenHeight > ScreenWidth) {
		ImgSize = Img2ScreenRatio * ScreenWidth;
	} else {
		ImgSize = Img2ScreenRatio * ScreenHeight;
	}
	ImgSize = Math.floor(ImgSize);

	await SeedRng();
	SeqAFirst = Rng() > 0.5;
	ImgAFirst = Rng() > 0.5;
	RunTrialLoop();
}