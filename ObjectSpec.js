// Import the main jsPsych object
var jsPsych = initJsPsych();

// Preload jsPsych object
var PreloadImgs = {
    type: jsPsychPreload,
    images: [
        './Imgs/i00.png',
        './Imgs/i01.png',
        './Imgs/i02.png',
        './Imgs/i03.png',
        './Imgs/i04.png',
        './Imgs/i05.png',
        './Imgs/i06.png',
        './Imgs/i07.png',
        './Imgs/i08.png',
        './Imgs/i09.png',
        './Imgs/i10.png',
        './Imgs/i11.png'
    ]
};

// Specify the EnterFullscreen event
var EnterFullscreen = {
    type: jsPsychFullscreen,
    message: '<p style="color:white;">The task is ready to begin.</p><p style="color:white;">Please click the button below to continue.</p>',
    fullscreen_mode: true,
    delay_after: 1000,
    on_finish: function () { EnforceUnfocus = true; }
};

// Specify the ExitFullscreen event
var ExitFullscreen = {
    type: jsPsychFullscreen,
    fullscreen_mode: false,
    on_finish: function () { EnforceUnfocus = false; }
};

// Specify the SetTrials object
var SetTrials = {
    type: jsPsychCallFunction,
    func: function () {
        // Update global variables
        SessionId = SessionId + 1;
        TrialId = -1;
        RunIdx = -1;
        if (SessionId===0) {
            ImgPermA = Shuffle([ 0, 1, 2, 3, 4, 5]);
            ImgPermB = Shuffle([ 6, 7, 8, 9,10,11]);
            var DataToSend = {};
            DataToSend.SubjectId = SubjectId;
            DataToSend.SeqAFirst = Number(SeqAFirst);
            DataToSend.ImgAFirst = Number(ImgAFirst);
            DataToSend.ImgPermA = JSON.stringify(ImgPermA);
            DataToSend.ImgPermB = JSON.stringify(ImgPermB);
            fetch('./WriteRegister.php', {
                method: 'post',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                body: JSON.stringify(DataToSend)
            });
        }
        if (Xor(SeqAFirst,(SessionId===1))) {
            SequenceId = 'A';
            Trials = SequenceA;
        } else {
            SequenceId = 'B';
            Trials = SequenceB;
        }
        if (Xor(ImgAFirst,(SessionId===1))) {
            ImgPerm = ImgPermA;
        } else {
            ImgPerm = ImgPermB;
        }
        ArrayOfResponseTags = GetArrayOfResponseTags();
    }
};

// Specify the pre-trial ops
var PreTrialOps = {
    type: jsPsychCallFunction,
    func: function () {
        // Update global variables
        TrialId = TrialId + 1;
        RunIdx = -1;
        AttemptNum = -1;
        AcceptResponse = true;
        CurrentRun = Trials[TrialId];
        CurrentRunLength = Trials[TrialId].length;
    }
};

// Specify the Fixation event
var Fixation = {
    type: jsPsychHtmlButtonResponse,
    stimulus: '<p><font color="#ffffff" size="30px">+</font></p>',
    choices: [],
    prompt: "",
    trial_duration: 1000
};

// Trial object that presents each Spark
var Show_Spark = {
    type: jsPsychHtmlButtonResponse,
    stimulus: function () {
        RunIdx = RunIdx + 1;
        CurrentStim = CurrentRun[RunIdx];
        NextStim = CurrentRun[RunIdx+1];
        var Fn = FieldIdx2ImgName(CurrentStim);
        var Tag = '<img src="' + Fn + '" width="400px" id="Cue_' + CurrentStim.toString().padStart(2, '0') + '"';
        return Tag;
    },
    choices: [],
    prompt: [],
    trial_duration: 2000
};

// Specify the Inter-cue-interval event
var ICI = {
    type: jsPsychHtmlButtonResponse,
    stimulus: '<p><font color="#ffffff" size="30px"></font></p>',
    choices: [],
    prompt: "",
    trial_duration: 200
};

// Interlude event
var Interlude = {
    type: jsPsychHtmlButtonResponse,
    stimulus: '<p><font color="#ffffff">You are half way through the task.<br /><br />Please continue when ready.</font></p>',
    choices: ["Continue"],
    prompt: ""
};

// Interlude event
var EndOfTask = {
    type: jsPsychHtmlButtonResponse,
    stimulus: '<p style="color:white;">The task is now complete.</p><p style="color:white;">Thank you for taking part.</p>',
    choices: [],
    prompt: ""
};

// Run object that loops through all images in the Run
var RunLoop = {
    timeline: [Show_Spark],
    loop_function: function () { 
        return RunIdx < (CurrentRunLength-2);
    }
};

// Specify the response prompt object
var ResponsePrompt = {
    type: jsPsychHtmlButtonResponse,
    stimulus: function () {
        var T1 = GetSparkOptions();
        return T1;
    },
    choices: [],
    prompt: [],
    trial_duration: null,
    on_start: function () {
        StartTime_ResponsePrompt = jsPsych.getTotalTime();
    }
};