## The idea

Fractals are graphs and shapes with infinite detail, often charactirized by being able to zoom in forever and never find a straight edge. 
Pick any complex number, and starting from z = 0, repeatedly apply one rule 

```python
z → z² + c
```
Some values of c send this sequence rapidly off to infinity while other values keep it wandering forever, converging on a value. The Mandelbrot set is the collection of values for c for which the sequence converges. Colour every point based on whether it converges or diverges to infinity and you create the Mandelbrot fractal. <br>

Using the widget below, you can click on points on the complex plain to see when these values are plugged in as c, whether the series converges or diverges at that point, seeing the shape the series makes as it iterates. 

{{widget}}

## What it shows

Picking a point within the fractal shows how it stays bounded within the fractal, slowly converging. Whereas, picking a point outside the fractal, the series quickly grows out and the |z| grows to infinity. Picking a point near the boundary highlights the intricacy of the fractal, sometimes the point picked will wonder for a long term and settle, and other times it will grow out of the fractal. This sensitivity is exactly why the mandelbrot is a fractal rather than a smooth curve, arbitrarily close points can have very different fates when plugged into the mandelbrot series. 

## Julia sets

![Image of a Julia Set](images/JuliaSet.png)

Julia sets are fractal of the same elk as the mandelbrot fractal but ask a different quesion, using the same iterative series the mandelbrot set uses. Instead of changing c for every point, the Julia sets fix c and change the starting z value. Because the starting value is changed, there are infinetly many Julia sets due to the fact that both z and c are changing changes the whole graph whereas with the mandelbrot, the starting z is kept constant. Julia sets can be incredible beautiful or very plainly a circle depending on the constant selected.
