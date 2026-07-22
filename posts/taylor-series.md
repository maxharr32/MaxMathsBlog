## The idea

Taylor series are infinite sums used to represent a function as a polynomial. Invented by Brook Taylor in 1715, the more terms in the polynomial, the more accurate the approximation will become. Taylor series are used to approximate values for sin, cos and e approximations. Using the box below you can look at different functions and how the accuracy of estimation increases as you increase the number of terms.  

{{widget}}

## Why its Useful

You may have heard of small angle approximation which is a use of the first or second terms of the taylor series for the sin and cos diagrams. Therefore any problem that uses a small angle approximation in its solution is a practical use of a Taylor series. <br>

I first encountered a practical use of a small angle aproximation when being taught simple harmonic motion. Within this topic you encounter a pendulum on a string and need to work out how far it is vertically from its lowest position. If L was the length of string and θ was the angle between the lowest position and the current position in radians, then the vertical displacement is the string length, minus Lcos(θ) which is the vertial component of the strings length at its current position. Therefore its certical displacement is L(1-cos(θ)) which is difficult to use and apply, unless you use small angle aproximation of 1 - θ^2/2 which then makes the problem much easier, into L(θ^2/2), removing the complex cos function and simplifying to simple algebra. 

## How to construct a Taylor Series

To contruct a Taylor series, you start with a tangent to the curve at the point of interest, starting by making sure that tangent goes through the point of interest by plugging the x co-ord into the original function. For cos, plugging in 0 gives us 1. Then you need to make sure the tangent has the same gradient to it stays close to the curve for longer, to do this you plug the x co-ord into the differential of the original function, for cos, plugging o into the differential (-sin) gives 0. Therefore your approximation starts as 1 + 0x. Therefore your small angle approximation of cos is just 1, however you can continue this pattern further. <br>

To continue the series, you need to make sure the rate of gradient change at the point of interest on the polynomial is the same as the original function. To do this you plug the x co-ord into the second differential of the original function. For cos, plugging in 0 to -cos gives -1 (-cos being the second differential of cos). However, you need to make sure the differentials of the polynomial are equal to the differential values of the original function. because the differential of the polynomial once differentiated twice is 2k (it started as kx^2 then differentiated to 2kx then just 2k, where k is a constant). using all this you must see that 2k must equal -1 and therefore k is -1/2 and therefore the third term of the Taylor series for cos is -1/2 x^2 and so the first three terms are 1 + 0 x + -1/2 x^2. <br>

you can continue this method to attain the Taylor series for cos, but commonly the Taylor series for cos is simplified into a sum to infinity due to the fact it follows a pattern and the complete Taylor Series would go on forever. <br>

A lovely video on Taylor Series with beautiful animations is on 3Blue1Brown where he shows the funtion as you add terms and breaks down general contruction of Taylor series.

