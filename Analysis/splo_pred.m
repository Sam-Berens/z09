function [pmf] = splo_pred(x,b)
% splo_pred.m
% Sam Berens (s.berens@sussex.ac.uk)
% 16/06/2025
%
% Syntax:  [pmf] = splo_pred(x, b)
%
% Description:
%    Predicts the probability mass function (pmf) over discrete response
%    bins using a Softplus-logistic model with the one-hot multinomal
%    distribution.
%
% Inputs:
%    x - Vector of predictor values.
%    b - A 2-element vector of model parameters.
%
% Outputs:
%    pmf    - Matrix of predicted probability mass functions for each 
%             trial. Each row corresponds to a trial, and each column 
%             corresponds to an response (the first column is the correct
%             response).
%
% Example:
%    [pmf] = spth_pred(x, [1, 0.5]);
%
% See also: splo_nll
%

logistic = @(x) 1./(1+exp(-x));
logit = @(p) log(p)-log(1-p);
cP = 1/6;
cX = logit(cP);
xPred = log(1+exp(x-b(1)))*b(2);
pCorr = logistic(xPred+cX);
pIncr = 1-pCorr;
pOthr = pIncr./5;
pmf = [pCorr,repmat(pOthr,1,5)];
return