async function LogUnfocus() {
    // Set the data to send
    var Data = {
        SubjectId: SubjectId,
        FunctionCall: 'LogUnfocus',
        Location: window.location.href
    };
    
    // Send the data
    var P1 = await fetch('./LogUnfocus.php', {
		method: 'post',
		headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
		body: JSON.stringify(Data)
	});

    // Return the Result ...
    // ... an object with two properties, 'Count' and 'Notice'.
    var Result = await P1.json();
    return Result;
}

async function LogRefocus() {
    // Set the data to send
    var Data = {
        SubjectId: SubjectId,
        FunctionCall: 'LogRefocus'
    };
    
    // Send the data
    var P1 = await fetch('./LogUnfocus.php', {
		method: 'post',
		headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
		body: JSON.stringify(Data)
	});

    // Return the Result ...
    // ... an object with one property, 'Bool'.
    var Result = await P1.json();
    return Result;
}

var EnforceUnfocus = false;
document.addEventListener("visibilitychange", (event) => {
    if (document.visibilityState != "visible") {
        if (Boolean(SubjectId) && EnforceUnfocus) {
            LogUnfocus().then(async function(P1){
                if (P1.Count < 4) {
                    alert(P1.Notice);
                    LogRefocus().then(async function(P2){
                        if (P2.Bool) {
                            // Away for too long
                            window.location.replace('./Coventry.html?SubjectId='+SubjectId+'&Reason=0#');
                        }
                    });
                } else {
                    // Away too many times
                    window.location.replace('./Coventry.html?SubjectId='+SubjectId+'&Reason=1#');
                }
            });
        }
    }
});