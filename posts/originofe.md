## The idea

e is one of a handful of undeniably useful mathematical values. Useful in economics, geography, calculus and even probability. This will give a short overview of its discovery, uses and how we get create an estimation. 

A mathematician, named Bernoulli, discovered e while studying a financial question of compound interest. Suppose you have an account with £1 and 100% interest after 1 year. After 1 year you will have £2. Now what if you got paid in 2 50% instalments, split equally throughout the year? After a year you would have £2.25. Now suppose you continue this, splitting the interest until you are being paid interest every second of the year. If this were possible and you put in £1, at the end of the year, you would have £e. This is the natural growth rate. 

## How e is Estimated

A far faster-converging definition comes from calculus: e is the number that shows up when you sum the reciprocals of every factorial, starting from 0! :

```python
e = 1/0! + 1/1! + 1/2! + 1/3! + 1/4! + ...
  = 1 + 1 + 1/2 + 1/6 + 1/24 + ...
```

You can play around with adding terms and seeing how it gets closer below.

{{widget:e-estimation}}

## What it shows

Watch the running total in the widget above climb quickly at first — adding the first few terms moves the estimate a lot — then slow down sharply. Each new term is a much smaller correction than the one before it, since dividing by a growing factorial shrinks each term fast: 1/10! is already smaller than one in three million. That's why so few terms are needed for high precision, in contrast to something like the π-estimation widget elsewhere on this site, where Monte Carlo convergence is comparatively slow and needs thousands of trials rather than a dozen terms.
