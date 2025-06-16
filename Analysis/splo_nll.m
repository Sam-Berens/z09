function [nll] = splo_nll(b,x,r)
% splo_nll.m
% Sam Berens (s.berens@sussex.ac.uk)
% 16/06/2025
%
% Syntax:  nll = splo_nll(b, x, theta)
%
% Description:
%    Computes the negative log-likelihood (nll) for a Softplus-logistic 
%    model using the one-hot multinomial distribution given a set of model 
%    parameters, predictor values, and observed responses.
%
% Inputs:
%    b     - A 2-element vector of model parameters.
%    x     - Vector of predictor values.
%    r     - Matrix of observed responses for each trial.
%
% Outputs:
%    nll   - The computed negative log-likelihood value.
%
% Example:
%    nll = splo_nll([1, 0.5], x, theta);
%
% See also: splo_pred
%

n = numel(x);
pmf = splo_pred(x,b);
nll = nan(n,1);
for iPred = 1:n
    cr = r(iPred,:);
    cr = cr(~isnan(cr));
    target = cr(end);

    p = pmf(iPred,:);
    % Sort the p dist so that the correct response is in the correct place
    pC = p(1);
    pI = p(2:end);
    p = [pI(1:target),pC,pI((target+1):end)];
    
    y = cr+1;
    ty = y(1:(end-1));
    nll(iPred) = sum(...
        [0,log(1-cumsum(p(ty)))] - ...
        log(p(y)) ...
    );
end
nll(~isfinite(nll)) = -log(eps());
nll = sum(nll);
return