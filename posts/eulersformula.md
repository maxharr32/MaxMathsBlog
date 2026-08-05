## The Equation

Euler's formula is a way of displaying imaginary numbers in a clean and discrete way, instead of the usual a + ib where the imaginary and real components are separated.

```python
  e^(ix) = cos(x) + i·sin(x)
```

You may wonder how e, the natural rate of growth, appears here and what relevance it has to imaginary numbers. And ultimately you may wonder how this all results in 'the most beautiful maths equation'

![Image of a Julia Set](images/Eulerbanner.png)

## Taylor Series

First we must recall the Taylor series of e, discussed in a previous article. This expansion is thus: 

```python
  e^x = 1 + x + x²/2! + x³/3! + x⁴/4! + x⁵/5! + ...
```

Now, instead, find the expansion of e^ix, where i is the square root of -1. This looks like below, where when i is squared, you end up with just -1:

```python
  e^(iθ) = 1 + iθ + (iθ)²/2! + (iθ)³/3! + (iθ)⁴/4! + ...
       = 1 + iθ − θ²/2! − iθ³/3! + θ⁴/4! + iθ⁵/5! − ...
```

Now with a bit of recognition, you may be able to realise that the parts that have i attached to them, are the terms that are in the Taylor series for sin and the terms without i is the Taylor series for cos. Therefore, you can transform the expansion into the equation at the start. 

{{widget:taylor-series}}

Euler's equation makes full sense when you thing about it in concern to the normal way of presenting imaginary numbers as a + ib. If you think about a unit circle (a circle with radius 1), the x co-ordinate is cos(x) and the y co-ord is sin(x), now apply this to the imaginary plane and you have your real component as cos(x) and your imaginary component as sin(x), hence cos(x) + isin(x). 

## The Famous Equation

Anyway, to create what is called the most beautiful equation, you sub in π for x and have cos(π) + isin(π) which = -1 and therefore:

```python
  e^(i\π) = -1 and therefore:
  e^(i\π) + 1 = 0
```

This is called the most beautiful equation as it combines 5 very important constants, π (the constant relating circumference to diameter), e (the natural rate of growth), i (the imaginary number), 1 (the first number) and 0. Again, this equation makes sense, think again of the unit circle mapped onto the imaginary plane. When you have rotated π radians around the origin (180 degrees) you have gone from 1 to -1, and have no imaginary component. Therefore, you can imagine that e^(iπ/2) would equal just i as you have done a 90 degree turn. 

{{widget:euler-rotation}}


