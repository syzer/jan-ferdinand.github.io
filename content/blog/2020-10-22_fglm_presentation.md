+++
template = "post.html"
title = "Converting Gröbner bases with FGLM"
[taxonomies]
tags = ["Algebra", "Gröbner basis", "Term Order Change", "FGLM", "AS Dicrete Mathematics"]
+++

| 🛈 |
| :- |
| I originally wrote this post when working for [AS Discrete Mathematics](https://asdm.gmbh) as part of a project sponsored by the [Ethereum Foundation](https://ethereum.foundation/). It is reproduced here with friendly permission. |

Have you ever computed a Gröbner basis in some monomial order
{% katex() %}
\prec_0
{% end %}
only to then realize that you _actually_ wanted it in another order
{% katex() %}
\prec_1
{% end %}
?
I know, happens _all_ the time…
But fret not, FGLM can convert between the two orders, and you don't have to start your computation from scratch.

![A visual summary of the execution of FGLM on an example input.](/blog/2020-10-22_fglm_summary.png "Left, a ")

[Here's a recording](https://www.bitchute.com/video/5TeyXMq4m7Gc/) where I'm explaining how FGLM works.
If you'd like to look through the slides at your own pace, [here they are](/blog/2020-10-22_fglm_example_animated.pdf).
You can also find the two Gröbner bases used in the example as well as pseudocode for FGLM in the slides, in case you want to retrace the steps yourself.

<p align="center">
<iframe scrolling="no" style="border: none;display:block;" src="https://www.bitchute.com/embed/5TeyXMq4m7Gc/" width="640" height="360" frameborder="0"></iframe>
</p>

If you are interested in not only _how_ but also _why_ FGLM works, have a look at the [original publication](https://doi.org/10.1006/jsco.1993.1051).
Section 5 and 6 give a comprehensive overview of FGLM's complexity, which can be summarized as
{% katex() %}
O(n\cdot D^3)
{% end %}
where {% katex() %}D{% end %} is the dimension of quotient ring
{% katex() %}
k[x_0, \dots, x_{n-1}] / \langle G \rangle
{% end %}
as a {% katex() %}k{% end %}-vector-space.
More intuitively, {% katex() %}D{% end %} is the number of monomials in the staircase of a Gröbner basis, which are those dots in the non-blue region in this post's first picture.

```python
def FGLM(order_new, gb_old, order_old):
    d = {}
    gb_new = []
    next_monoms = [1]
    while next_monoms:
        monom = min(next_monoms) # according to order_new
        next_monoms -= monom
        if no g in gb_new such that LM(g) | monom:
            # monom is still within staircase
            reduced_monom = monom.reduce(gb_old, order_old)
            if reduced_monom + sum([w[u] * v for u, v in d.items()]) == 0 for some w:
                # w[i] are field elements, i.e., coefficients.
                # they can be found by Gaussian reduction of d.values()
                gb_new += monom + sum([w[u] * u for u, v in d.items()])
            else:
                d += {monom : reduced_monom}
                next_monoms += [x_i * monom for i in range(n)]
    return gb_new
```
