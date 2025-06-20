%% Get the data
TaskIO = webread('https://z09.learningandinference.org/GetTaskIO.php');

%% Recode vars
TaskIO = struct2table(TaskIO);
TaskIO.AttemptId = categorical(TaskIO.AttemptId);
TaskIO.SubjectId = categorical(TaskIO.SubjectId);
TaskIO.SessionId = str2double(TaskIO.SessionId);
TaskIO.SequenceId = categorical(TaskIO.SequenceId);
TaskIO.TrialId = str2double(TaskIO.TrialId);
TaskIO.Run = cellfun(@str2num,TaskIO.Run,'UniformOutput',false);
TaskIO.AttemptNum = str2double(TaskIO.AttemptNum);
TaskIO.FieldIdx_C = str2double(TaskIO.FieldIdx_C);
TaskIO.FieldIdx_R = str2double(TaskIO.FieldIdx_R);
TaskIO.Correct = logical(str2double(TaskIO.Correct));
TaskIO.RT = str2double(TaskIO.RT);
TaskIO.DateTime_Write = datetime(TaskIO.DateTime_Write);
TaskIO = sortrows(TaskIO,"DateTime_Write","ascend");

%% Filter
TaskIO = TaskIO(TaskIO.SubjectId~=categorical({'JonnyTest'}),:);

%%
uSubjectId = unique(TaskIO.SubjectId);
SubjectId = [];
SessionId = [];
SequenceId = [];
TrialId = [];
x = [];
c = [];
r = {};
rt = [];
for iSubject = 1:numel(uSubjectId)
    Tsub = TaskIO(TaskIO.SubjectId==uSubjectId(iSubject),:);
    uSessionIds = unique(Tsub.SessionId);
    for iSess = 1:numel(uSessionIds)
        Tses = Tsub(Tsub.SessionId==uSessionIds(iSess),:);
        uTrialIds = unique(Tses.TrialId);
        for iTrial = 1:numel(uTrialIds)
            Ttri = Tses(Tses.TrialId==uTrialIds(iTrial),:);
            if iTrial==1
                numStates = numel(Ttri.Run{1});
            else
                numStates = numStates+numel(Ttri.Run{1})-1;
            end
            SubjectId = [SubjectId;Ttri.SubjectId(1)]; %#ok<*AGROW>
            SessionId = [SessionId;Ttri.SessionId(1)];
            SequenceId = [SequenceId;Ttri.SequenceId(1)];
            TrialId = [TrialId;Ttri.TrialId(1)];
            x = [x;floor((numStates-1)/11)];
            c = [c;Ttri.FieldIdx_C(1)];
            v = Ttri.FieldIdx_R;
            [v,iv] = unique(v,'stable');
            r = [r;{v}];
            rt = [rt;{Ttri.RT(iv)}];
        end
    end
end
DataTable00 = table(SubjectId,SessionId,SequenceId,TrialId,x,c,r,rt);

%%
SubjectId = [];
SeqOrder = [];
S1_b0 = [];
S1_b1 = [];
S1_nll = [];
S2_b0 = [];
S2_b1 = [];
S2_nll = [];
pCorrect = [];
for iSubject = 1:numel(uSubjectId)
    SubjectId = [SubjectId;uSubjectId(iSubject)];
    Tsub = DataTable00(DataTable00.SubjectId==uSubjectId(iSubject),:);
    uSessionIds = unique(Tsub.SessionId);
    if isscalar(uSessionIds)
        S2_b0 = [S2_b0;NaN];
        S2_b1 = [S2_b1;NaN];
        S2_nll = [S2_nll;NaN];
    end
    for iSess = 1:numel(uSessionIds)
        Tses = Tsub(Tsub.SessionId==uSessionIds(iSess),:);
        if iSess == 1
            if Tses.SequenceId(1)==categorical({'A'})
                SeqOrder = [SeqOrder;0];
            else
                SeqOrder = [SeqOrder;1];
            end
        end
        x = Tses.x;
        maxX = max(x);
        Y = nan(numel(x),6);
        for ii = 1:size(Tses,1)
            r = Tses.r{ii};
            if numel(r) < 6
                r = [r;nan(6-numel(r),1)];
            end
            Y(ii,:) = r';
        end
        A = [-1,0;1,0;0,-1;0,1];
        b = [0;maxX+1;0;1];
        problem = createOptimProblem(...
            'fmincon',...
            'x0',[maxX/2;0.01],...
            'objective',@(p) splo_nll(p,x,Y),...
            'Aineq',A,'bineq',b);
        [bHat,nll] = run(MultiStart,problem,50);
        if abs(bHat(2)-1)<(1e-6)
            bHat = [NaN;NaN];
            nll = NaN;
        end
        pmf = splo_pred(x,bHat);
        pCorrect = [pCorrect;pmf(:,1)];
        if iSess == 1
            S1_b0 = [S1_b0;bHat(1)];
            S1_b1 = [S1_b1;bHat(2)];
            S1_nll = [S1_nll;nll];
        else
            S2_b0 = [S2_b0;bHat(1)];
            S2_b1 = [S2_b1;bHat(2)];
            S2_nll = [S2_nll;nll];
        end
    end
end
DataTable00.pCorrect = pCorrect;
DataTable01 = table(SubjectId,SeqOrder,S1_b0,S2_b0,S1_b1,S2_b1,S1_nll,S2_nll);

[~,p,ci,stats] = ttest(DataTable01.S2_b1-DataTable01.S1_b1);
stats.p = p;
stats.ci = ci;
disp(stats);
figure;
scatterhist(DataTable01.S1_b1,DataTable01.S2_b1);

%%
figure;
SId1 = [];
SId2 = [];
for iSubject = 1:numel(uSubjectId)
    SubjectId = [SubjectId;uSubjectId(iSubject)];
    Tsub = DataTable00(DataTable00.SubjectId==uSubjectId(iSubject),:);
    uSessionIds = unique(Tsub.SessionId);
    for iSess = 1:numel(uSessionIds)
        Tses = Tsub(Tsub.SessionId==uSessionIds(iSess),:);
        subplot(1,2,iSess);
        hold on;
        plot(Tses.x,Tses.pCorrect);
        if iSess == 1
            SId1 = [SId1;Tses.SubjectId(1)];
        else
            SId2 = [SId2;Tses.SubjectId(1)];
        end
    end
end
subplot(1,2,1);
legend(SId1,'location','nw');
subplot(1,2,2);
legend(SId2,'location','nw');