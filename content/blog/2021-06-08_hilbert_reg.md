+++
template = "post.html"
title = "Understanding and Computing the Hilbert Regularity"
[taxonomies]
tags = ["Algebra", "Gröbner basis", "AS Discrete Mathematics"]
+++

| 🛈 |
| :- |
| I originally wrote this post when working at [AS Discrete Mathematics](https://asdm.gmbh) as part of a project sponsored by the [Ethereum Foundation](https://ethereum.foundation/). It is reproduced here with friendly permission. |

When attacking [AOCs](https://asdm.gmbh/arithmetization-oriented-ciphers/aoc-project/) using Gröbner bases, the most relevant question is:
how complex is the Gröbner basis computation?
One commonly used estimation is based on the _degree of regularity_.
Intuitively, the degree of regularity is the degree of the highest-degree polynomials to appear during the Gröbner basis computation.
([Whether this metric is good for estimating the AOC's security is a different matter](@/blog/2021-05-18_dreg-insufficient-for-security.md).)

Unfortunately, different authors define the term “degree of regularity” differently.
In this post, I use the understanding of Bardet et al. [1,2], which coincides with the well-defined _Hilbert regularity_.

I first introduce the required concepts, and then make them more tangible with some examples.
Lastly, there is some [sagemath](https://www.sagemath.org/) code with which the Hilbert regularity can be computed.

# Definition of the Hilbert Regularity

Let {% katex() %}\mathbb{F}{% end %}
be some field,
{% katex() %}R = \mathbb{F}[x_0, \dots, x_{n-1}]{% end %}
a polynomial ring in {% katex() %}n{% end %} variables over
{% katex() %}\mathbb{F}{% end %},
and
{% katex() %}I \subseteq R{% end %}
a polynomial ideal of {% katex() %}R{% end %}.

The affine Hilbert function of quotient ring {% katex() %}R/I{% end %} is defined as
{% katex(block="true") %}
{}^a\textsf{HF}_{R/I}(s) = \dim_\mathbb{F}\!\left(R_{\leqslant s} \middle/ I_{\leqslant s}\right).
{% end %}
For some large enough value {% katex() %}s_0{% end %}, the Hilbert function of all {% katex() %}s \geqslant s_0{% end %} can be expressed as a polynomial in {% katex() %}s{% end %}.
{% sidenote(label="background") %}
    For a general treatment of the _how?_ and _why?_, have a look at the excellent book “Ideals, Varieties, and Algorithms,” [3] in particular Chapter 9, §2, Theorem 6, and Chapter 9, §3.
    The examples in this post hopefully shed some light, too.
{% end %}
This polynomial, denoted {% katex() %}{}^a\textsf{HP}_{R/I}(s){% end %}, is called _Hilbert polynomial_.
By definition, the values of the Hilbert function and the Hilbert polynomial coincide for values greater than {% katex() %}s_0{% end %}.

The **Hilbert regularity** is the smallest {% katex() %}s_0{% end %} such that for all {% katex() %}s \geqslant s_0{% end %}, the evaluation of the Hilbert function in {% katex() %}s{% end %} equals the evaluation of the Hilbert polynomial in {% katex() %}s.{% end %}

By the [rank-nullity theorem](https://en.wikipedia.org/wiki/Rank%E2%80%93nullity_theorem), we can equivalently write the Hilbert function as
{% katex(block="true") %}
{}^a\textsf{HF}_{R/I}(s) = \dim_\mathbb{F}\! \left( R_{\leqslant s} \right) - \dim_\mathbb{F}\! \left( I_{\leqslant s}\right).
{% end %}
This is a little bit easier to handle, because we can look at {% katex() %}R{% end %} and {% katex() %}I{% end %} separately and can ignore the quotient ring {% katex() %}R/I{% end %} for the moment.
By augmenting {% katex() %}R{% end %} with a graded monomial order, like [degrevlex](https://en.wikipedia.org/wiki/Monomial_order#Graded_reverse_lexicographic_order), we can go one step further and look at leading monomials {% katex() %}\textsf{lm}{% end %} only:
the set
{% katex() %}\{ \textsf{lm}(f) \mid f \in I, \deg(f) \leqslant s \}{% end %}
is a basis for
{% katex() %}I_{\leqslant s}{% end %} as an {% katex() %}\mathbb{F}{% end %}-vector space.
{% sidenote(label="f_v_space") %}
See [3, Chapter 9, §3, Proposition 4] for a full proof.
{% end %}
Meaning we don't even need to look at {% katex() %}I{% end %}, but can restrict ourselves to the ideal of leading monomials {% katex() %}\langle \textsf{lm}(I) \rangle{% end %}.
{% katex(block="true") %}
{}^a\textsf{HF}_{R/I}(s) = \dim_\mathbb{F}\!\left(R_{\leqslant s}\right) - \dim_\mathbb{F}\!\left( \langle \textsf{lm}(I) \rangle_{\leqslant s}\right).{% end %}

One way to get a good grip on {% katex() %}\langle I \rangle{% end %} is through reduced Gröbner bases.
A Gröbner basis {% katex() %}G{% end %} for ideal {% katex() %}I{% end %} is a finite set of polynomials with the property
{% katex() %}\langle G \rangle = \langle I \rangle{% end %}
and, more relevant right now,
{% katex() %}\langle \textsf{lm}(G) \rangle = \langle \textsf{lm}(I) \rangle.{% end %}
This means it's sufficient to look at (the right combinations) of elements of {% katex() %}\textsf{lm}(G).{% end %}
This, in turn, is more manageable because {% katex() %}G{% end %} always has finitely many elements, but {% katex() %}I{% end %} might not.

## Example: 0-Dimensional Ideal

Let's start with a super simple polynomial system:
{% katex(block="true") %}
G = \{x^6, x^2y^2, y^5\} \subseteq \mathbb{F}[x,y], \quad I = \langle G \rangle
{% end %}
for some finite field
{% katex() %}\mathbb{F}.{% end %}
This is a zero-dimensional, monomial (thus homogeneous) ideal.
That's about as special as a special case can get.
Note that here, we have
{% katex() %}I = \langle \textsf{lm}(I) \rangle{% end %}, but this doesn't generally hold.
Dealing with a super-special case also means that the Hilbert polynomial is relatively boring, but that's fine for starting out.
{% katex() %}G{% end %} is the reduced Gröbner basis for {% katex() %}I{% end %}, and we'll use its elements to help computing the Hilbert function.

A benefit of ideals in two variables is:
we can draw pictures.

{{ figure(src="/blog/2021-06-08_monomial_ideal-1.png", caption="The monomials of 𝔽[<em>x</em>,<em>y</em>] seen as 𝔽-vector space.") }}

This is what the monomials of {% katex() %}\mathbb{F}[x,y]{% end %} as an {% katex() %}\mathbb{F}{% end %}-vector space look like.
Well, at least the part {% katex() %}\{x^ay^b \mid a \leqslant 8, b \leqslant 7 \}.{% end %}
After all, {% katex() %}\mathbb{F}[x,y]{% end %} as an {% katex() %}\mathbb{F}{% end %}-vector space has infinite dimension.
I have (arbitrarily) highlighted {% katex() %}x^3y^2,{% end %} i.e., coordinate (3,2), to give a better understanding of what the picture means.

Since {% katex() %}I{% end %} is a monomial ideal, we can highlight every element in {% katex() %}I{% end %}.
The circles of the elements of the Gröbner basis {% katex() %}G{% end %} are red.
The zig-zig pattern of the boundary between {% katex() %}x^ay^b \in I{% end %} and {% katex() %}x^ay^b \notin I{% end %} is inherent, and generalizes to higher dimensions, i.e., more variables.
Because of the zig-zagging, the set of monomials not in {% katex() %}\langle \textsf{lm}(I) \rangle{% end %} is referred to as _staircase_ of {% katex() %}I.{% end %}

{{ figure(src="/blog/2021-06-08_monomial_ideal-2.png", caption="The <em>staircase</em> of &langle;G&rangle;.") }}

Let's start computing the Hilbert function for {% katex() %}R/I.{% end %}
The {% katex() %}\mathbb{F}{% end %}-vector space dimensions of {% katex() %}R_{\leqslant s}{% end %} and {% katex() %}I_{\leqslant s}{% end %} are simply the number of monomials in {% katex() %}R{% end %} respectively {% katex() %}I{% end %} with degree {% katex() %}\leqslant s.{% end %}
Getting those numbers is easy – it amounts to counting dots in the picture!
For example, for {% katex() %}s=2,{% end %}, we have {% katex() %}{}^a\textsf{HF}_{R/I}(2)=5-0=5:{% end %}

{{ figure(src="/blog/2021-06-08_monomial_ideal-3.png", caption="The Hilbert Function of <em>I</em> at <em>s = 2</em>.") }}

No monomial of total degree less than or equal to 2 is in {% katex() %}I{% end %}, so computing the Hilbert function is a little bit boring here.

{{ figure(src="/blog/2021-06-08_monomial_ideal-5.png", caption="The Hilbert Function of <em>I</em> at <em>s = 5</em>.") }}

The value of the Hilbert function
{% katex() %}{}^a\textsf{HF}_{R/I}(5){% end %}
is more interesting:
some monomials of degree {% katex() %}\leqslant 5{% end %} are indeed elements of {% katex() %}I{% end %}, and thus {% katex() %}\dim I_{\leqslant 5}{% end %} is not 0 but 4.
In particular, we have {% katex() %}{}^a\textsf{HF}_{R/I}(5)=21 - 4=17.{% end %}
For {% katex() %}s=6,{% end %} we have {% katex() %}{}^a\textsf{HF}_{R/I}(6)=28-10=18:{% end %}

{{ figure(src="/blog/2021-06-08_monomial_ideal-6.png", caption="The Hilbert Function of <em>I</em> at <em>s = 6</em>.") }}

From this point forward, increasing {% katex() %}s{% end %} will not change the value of the Hilbert function –
the dimension of {% katex() %}I_{\leqslant s}{% end %} as an {% katex() %}\mathbb{F}{% end %}-vector space grows with the same rate as the dimension of {% katex() %}R_{\leqslant s}{% end %}, since all monomials _not_ in {% katex() %}I{% end %} are of lesser total degree.
Expressed differently, all monomials above the line are elements of both {% katex() %}I{% end %} and {% katex() %}R{% end %} –
the values of the Hilbert function doesn't change by increasing {% katex() %}s.{% end %}

{{ figure(src="/blog/2021-06-08_monomial_ideal-7.png", caption="The Hilbert Function of <em>I</em> at <em>s = 7</em>.") }}

From this, two things follow:
1. The Hilbert polynomial of {% katex() %}R/I{% end %} is the constant 18.
(That's why I said it's relatively boring.
A more interesting case follows.)
1. The Hilbert regularity of {% katex() %}R/I{% end %} is 6, since {% katex() %}{}^a\textsf{HF}_{R/I}(s) = {}^a\textsf{HP}_{R/I}(s){% end %} for all {% katex() %}s \geqslant 6.{% end %}

## Example: Ideal of Positive Dimension

As hinted at above, whether or not {% katex() %}I{% end %} is a monomial ideal does not matter for computing the Hilbert function or the Hilbert polynomial, because {% katex() %}\textsf{lm}(I){% end %} behaves exactly the same.
What does matter, though, is the dimension of {% katex() %}I.{% end %}
In the previous example, {% katex() %}I{% end %} was of dimension 0, and the Hilbert polynomial of {% katex() %}R/I{% end %} was a constant.
That's not a coincidence.

Even though the ideal spanned by the polynomial system modelling an AOC will usually be zero-dimensional, it's interesting to see what happens if it isn't.
Let's take {% katex() %}G = \{x^4y^3, x^2y^5\} \subseteq \mathbb{F}[x,y]{% end %} and {% katex() %}I = \langle G \rangle.{% end %}

{{ figure(src="/blog/2021-06-08_monomial_ideal_poly-0.png", caption="The “staircase” of &langle;G&rangle;. Some of the stairs' steps are pretty large.") }}

As you can see, there are parts of the staircase that extend to infinity.
That's a direct consequence of {% katex() %}I{% end %} having positive dimension, or, equivalently, variety {% katex() %}V(I){% end %} not having finitely many solutions.
In the picture below, I've indicated the staircase's five subspaces of dimension {% katex() %}1{% end %} by dashed, gray lines.

{{ figure(src="/blog/2021-06-08_monomial_ideal_poly-1.png", caption="The five subspaces of <em>I</em> with dimension 1.") }}

For the Hilbert function, only monomials in {% katex() %}I{% end %} of degree {% katex() %}\leqslant s{% end %} are relevant.
For each of the five subspaces, we can express the matching number of elements as a polynomial in {% katex() %}s.{% end %}

{{ figure(src="/blog/2021-06-08_monomial_ideal_poly-2.png", caption="The number of monomials in each of the 1-dimensional subspaces as a function of s.") }}

The sum of these five polynomials is {% katex() %}5s+1,{% end %} which corresponds to the total number of monomials in the staircase of {% katex() %}I{% end %} of degree {% katex() %}\leqslant s{% end %} that lie in the staircase's 1-dimensional subspaces –
except that some elements are counted more than once.
Since the intersection of two orthogonal 1-dimensional subspaces is of dimension {% katex() %}0{% end %}, we can simply add a constant correction term.
{% sidenote(label="higher_dim_correction") %} For ideals with more than two variables, we generally need to add correction terms of higher dimension, corresponding to polynomial summands of degree higher than 0. {% end %}

{{ figure(src="/blog/2021-06-08_monomial_ideal_poly-3.png", caption="The correction term for monomials counted twice is 6.") }}

Adding the correction term of {% katex() %}-6{% end %} gives {% katex() %}5s-5{% end %} as a (preliminary) Hilbert polynomial for {% katex() %}I.{% end %}
We're not completely done yet:
for {% katex() %}s > 4{% end %}, there are monomials not in {% katex() %}I{% end %} that are also not in any of the 1-dimensional subspaces –
for example {% katex() %}x^3y^3.{% end %}
Of those, we only have finitely many.
In the example, it's 4.

{{ figure(src="/blog/2021-06-08_monomial_ideal_poly-4.png", caption="The correction term for monomials not counted at all is 4.") }}

After adding the second correction term, we have {% katex() %}{}^a\textsf{HP}_{I/R}(s)=5s-1{% end %}.

{{ figure(src="/blog/2021-06-08_monomial_ideal_poly-5.png", caption="The staircase of &langle;G&rangle; with 1-dimensional subspaces and both correction terms.") }}

By finding the Hilbert polynomial, we also computed the Hilbert regularity of {% katex() %}R/I:{% end %}
it's {% katex() %}7.{% end %}
In other words, for {% katex() %}s\geqslant 7,{% end %} we have {% katex() %}\dim_\mathbb{F}(R/I) = {}^a\textsf{HF}_{R/I}(s) = {}^a\textsf{HP}_{R/I}(s) = 5s-1.{% end %}

This coincides with the distance of the closest diagonal
{% sidenote(label="hyperplane") %}Generally speaking, the diagonal is a hyperplane.{% end %}
such that all “overlapping” as well as all zero-dimensional parts of the staircase are enclosed –
the red and blue dashed circles, respectively, in above picture.

# More Variables, More Dimensions

The intuition of the 2-dimensional examples above translate to higher dimensions:
find the most distant corner of the blue circle –
the parts where positive-dimensional subspaces of the variety overlap –
and the red circle –
the variety's part of dimension zero –
and take the distance of the farther of these two corners as the Hilbert regularity.
However, finding the corners becomes less trivial.
Let me demonstrate with a staircase consisting of three “tunnels” that we'll successively modify.

{{ figure(src="/blog/2021-06-08_monomial_ideal_3D-0.png", caption="Ideal &langle;G&rangle; as 3-dimensional 𝔽-vector space.") }}

Above staircase is defined by {% katex() %}G=\{x^2y, x^2z^3, yz^2\}.{% end %}
No monomials exist in the red bubble –
every point is part of a subspace of dimension 1.
The blue corner is the monomial defining the enclosing space of the parts where positive-dimensional subspaces overlap.
It coincides with the least common multiple (lcm) of the three elements of {% katex() %}G,{% end %} namely {% katex() %}m=x^2yz^3.{% end %}
The Hilbert regularity can be read off from {% katex() %}m\!{% end %}:
the hyperplane's required distance is {% katex() %}\deg(x^{(2-1)}y^{(1-1)}z^{(3-1)})=3.{% end %}

That was easy enough.
Let's take a look at {% katex() %}G' = \{x^2y, yz^2, z^3\}.{% end %}
The staircase looks similar, with the exception for the “{% katex() %}z{% end %}-tunnel.”

{{ figure(src="/blog/2021-06-08_monomial_ideal_3D-1.png", caption="Closing off the “tunnel” along the z-axis changes the Hilbert regularity.") }}

Even though {% katex() %}m{% end %} from above is still on the “border” of {% katex() %}\langle G' \rangle,{% end %} just as it was for {% katex() %}\langle G \rangle,{% end %} it no longer defines the enclosing space we're looking for.
Note that the lcm of the elements in {% katex() %}G'{% end %} is still {% katex() %}m,{% end %} but the Hilbert regularity is now defined by the lcm of only two elements, {% katex() %}x^2y{% end %} and {% katex() %}yz^2,{% end %} giving {% katex() %}m' = x^2yz^2.{% end %}
The Hilbert regularity has changed to {% katex() %}2.{% end %}

Let's modify the staircase a little bit more, and look at {% katex() %}G^\dagger = \{x^2, yz^2, z^3\}.{% end %}

{{ figure(src="/blog/2021-06-08_monomial_ideal_3D-2.png", caption="Additionally closing off the “tunnel” along the x-axis changes the Hilbert regularity again.") }}

he Hilbert regularity can once again be found by looking at {% katex() %}m = x^2yz^3,{% end %} but the reason has changed.
This time around, {% katex() %}m{% end %} is the most distant corner of the volume enclosing all monomials not appearing in positive-dimensional subspaces of the variety –
that's the red bubble from before.
And since only one “tunnel” remains, there's no more overlap in positive-dimensional subspaces –
the blue bubble, and with it the blue dot, have disappeared.
Note that {% katex() %}m{% end %} is once again the lcm of the three elements of {% katex() %}G^\dagger.{% end %}
The Hilbert regularity is now again 3.

For completeness sake, let's close off the last of the tunnels by adding {% katex() %}y^4{% end %} to {% katex() %}G^\dagger.{% end %}
Monomial {% katex() %}m^\dagger = x^2y^4z^2,{% end %} being the lcm of {% katex() %}x^2,{% end %} {% katex() %}yz^2,{% end %} and {% katex() %}y^4,{% end %} is the Hilbert regularity-defining corner.
The Hilbert regularity for {% katex() %}G^\dagger{% end %} is 5.

{{ figure(src="/blog/2021-06-08_monomial_ideal_3D-3.png", caption="Additionally closing off the “tunnel” along the y-axis again changes the Hilbert regularity.") }}

# Computing the Regularity in sagemath

After having understood the Hilbert regularity, it's time to throw some [sagemath](https://www.sagemath.org/) at the problem.
Below, you can find two approaches.
The first uses the staircase, like in the examples above.
The second is based on the _Hilbert series_, which is explained [further below](#math-approach).

## The nice-to-visualize geometric approach

Using the geometric intuitions from above, we can compute the Hilbert regularity by finding all of the staircase's corners.
The code below only works for ideals of dimension 0
{% sidenote(label="negative_dim") %}Technically, the code works for any dimension ≤ 0, i.e., if there are no common solutions to the polynomials in the ideal, it also works.{% end %}
since the polynomial models I do research on are always of that kind.

{{ figure(src="/blog/2021-06-08_finding_corners.png", caption="A general method to identify whether the lcm of some elements of G are a corner of the staircase.") }}

The code computes all lcm's of subsets of size {% katex() %}n{% end %} of the Gröbner basis' leading monomials, which we have determined as the points of interest above.
Any such lcm corresponding to a monomial that's flush to one of the 0-planes is ignored as being degenerate –
for example, the turquoise cross in below picture.
Next, we check if the lcm-monomial is actually a corner of the staircase, by moving one step towards the origin along all axes.
If the resulting monomial is in the ideal, it is not in the staircase, and thus not a corner –
for example, the red cross in above picture.
If, from the moved-to monomial, moving one step along any axis crosses the border of the staircase, we found a corner –
for example, both of the blue crosses in above picture, but not the orange cross in the picture below.
The distance of the furthest such corner corresponds to the Hilbert regularity.

{{ figure(src="/blog/2021-06-08_finding_corners_3D.png", caption="Some edge cases when determining whether a monomial is a corner are most clearly seen in the 3-dimensional case.") }}

With those pictures in mind, following the code should be fairly doable:

```py
import combinations
def hilbert_regularity_staircase(I):
    '''
    Compute the Hilbert regularity of R/I where R = I.ring() and I.dimension() <= 0.
    This is done by iterating through all n-tuples of the Gröbner basis' leading monomials,
    computing their lcm, then determining if that lcm is actually a corner of the staircase.
    The corner that is the furthest from the origin determines the Hilbert regularity.
    '''
    if I.dimension() > 0:
        raise NotImplementedError(f"Ideal must be of dimension 0 or less, but has dim {I.dimension()}.")
    gens = I.ring().gens() # all variables
    n = len(gens)
    xyz = reduce(operator.mul, gens, 1)
    gb_lm = [f.lm() for f in I.groebner_basis()]
    I_lm = Ideal(gb_lm)
    hil_reg = 0
    for lms in combinations(gb_lm, n):
        m = lcm(lms)
        # are we considering a meaningful combination of lm's?
        # i.e., does every variable make an appearance in m?
        if len(m.degrees()) != n or not all(m.degrees()):
            continue
        m = m / xyz # 1 step towards origin along all axes
        assert I.ring()(m) == m.numerator() # no negative exponents, please
        m = I.ring()(m)
        # are we in a corner of the staircase?
        # i.e., not in the ideal, but moving 1 step along any axis, we end up in the ideal?
        if not m in I_lm and all([v*m in I_lm for v in gens]):
            hil_reg = max(hil_reg, m.degree())
    return hil_reg
```

## The rigorous mathematical approach {#math-approach}

The Hilbert regularity can also be computed using the [_Hilbert series_](https://en.wikipedia.org/wiki/Hilbert_series_and_Hilbert_polynomial).
The Hilbert series is the formal power series of the (projective) Hilbert function:
{% sidenote(label="projective") %}We can either look at the projective Hilbert function, or equivalently subtract two consecutive values of the affine Hilbert function, as I am doing here.{% end %}
{% katex(block="true") %}
\textsf{HS}_{R/I}(t) = \sum_{s=1}^{\infty}({}^a\textsf{HF}_{R/I}(s) - {}^a\textsf{HF}_{R/I}(s-1))t^s
{% end %}
The Hilbert series' coefficient of monomial {% katex() %}t^d{% end %} is the number of monomials of degree {% katex() %}d{% end %}
{% sidenote(label="equality") %}Unlike before, we only consider equality now!{% end %}
that are in {% katex() %}R{% end %} but not in {% katex() %}I.{% end %}
The Hilbert regularity coincides with the degree of the highest-degree consecutive term having positive coefficient.

For example, take {% katex() %}I{% end %} from the very first example again, where we had {% katex() %}G = \{x^6, x^2y^2, y^5\}.{% end %}
Evaluating the Hilbert function of {% katex() %}R/I{% end %} gives {% katex() %}(1, 3, 6, 10, 14, 17, 18, 18, \dots).{% end %}
The Hilbert series of {% katex() %}R/I{% end %} is
{% katex(block="true") %}
\textsf{HS}_{R/I}(t) = 1 + 2t + 3t^2 + 4t^3 + 4t^4 + 3t^5 + t^6.
{% end %}
And indeed, the sought-for term has degree {% katex() %}6,{% end %} which we have seen to be the Hilbert regularity of {% katex() %}R/I.{% end %}

Conveniently, sagemath has a method for computing the Hilbert series of an ideal, albeit only for homogeneous ideals.
As we have established above, the Hilbert regularity does not change when looking only at the leading monomials of the ideal's Gröbner basis, which is a homogeneous ideal.
Thus, finally, we have a catch-all piece of code for computing the Hilbert regularity.

```py
def hilbert_regularity(I):
    '''
    Compute the Hilbert regularity of R/I using the Hilbert series of R/I.
    '''
    gb_lm = [f.lm() for f in I.groebner_basis()]
    I_lm = Ideal(gb_lm)
    hil_ser = I_lm.hilbert_series()
    hil_reg = hil_ser.numerator().degree() - hil_ser.denominator().degree()
    return hil_reg
```

# Summary

In this post, we have looked at the Hilbert function, the Hilbert polynomial, the Hilbert regularity, and the Hilbert series.
For the first two of those, extensive examples have built intuition for what the Hilbert regularity is –
and why it is not trivial to compute using this intuition.
Instead, the Hilbert series gives us a tool to find the Hilbert regularity fairly easily.

# References

1. Magali Bardet, Jean-Charles Faugère, Bruno Salvy, and Bo-Yin Yang.
_Asymptotic behaviour of the degree of regularity of semi-regular polynomial systems_.
In Proceedings of MEGA, volume 5, 2005.
1. Alessio Caminata and Elisa Gorla.
_Solving multivariate polynomial systems and an invariant from commutative algebra_.
arXiv preprint arXiv:1706.06319, 2017.
1. David A. Cox, John Little, and Donal O’Shea.
_Ideals, Varieties, and Algorithms: An Introduction to Computational Algebraic Geometry and Commutative Algebra_.
Springer Science & Business Media, 2013.
