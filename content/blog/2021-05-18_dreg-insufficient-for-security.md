+++
template = "post.html"
title = "Why the Degree of Regularity Alone is Bad for Estimating Security – a Counter Example to Common Arguments"
[taxonomies]
tags = ["Algebra", "Gröbner basis", "Degree of Regularity", "AS Discrete Mathematics"]
+++

| 🛈 |
| :- |
| I originally wrote this post when working at [AS Discrete Mathematics](https://asdm.gmbh) as part of a project sponsored by the [Ethereum Foundation](https://ethereum.foundation/). It is reproduced here with friendly permission. |

Cryptographic primitives designed to be algebraically simple – [AOCs](https://asdm.gmbh/arithmetization-oriented-ciphers/) – might be particularly vulnerable to algebraic attacks.
One of the most threatening attack vectors in this category is the [Gröbner basis analysis](@/blog/2020-08-12_introduction-to-gb-attacks-on-aoc.md).
For a cipher or hash function to be considered secure, the Gröbner basis for any polynomial system derivable from the primitive needs to be intractable to compute.

Unfortunately, the complexity of computing a Gröbner basis for a specific polynomial system is generally not known before the computation is completed.
However, some complexity bounds exist.
One of the most prominently used bounds is based on a polynomial system's [degree of regularity](https://asdm.gmbh/2021/03/15/d_reg/).

Generally, computing the degree of regularity for a polynomial system is as hard as [computing the Gröbner basis](https://asdm.gmbh/2021/04/16/dreg-from-gb/) itself.
Luckily, for an “[average](https://staff.math.su.se/shapiro/ProblemSolving/Pardue.pdf)”[regular](https://en.wikipedia.org/wiki/Regular_sequence) determined system, the degree of regularity equals the _Macaulay bound_.
That is, for {% katex() %}\mathcal{F} = \{f_0, \dots, f_{s-1}\} \subseteq \mathbb{F}[x_0, \dots, x_{n-1}]{% end %} we have {% katex() %}d_\text{reg} = 1 + \sum_{i=0}^{s-1}\deg(f_i) - 1.{% end %}

# How Current AOCs Argue Resistance to Gröbner Basis Analysis

The **Poseidon** [6] paper mentions the Macaulay bound, and implicitly assumes that the polynomial system arising from Poseidon is a regular sequence.
My own experiments indicate that this assumption is _false_.
Similarly, **GMiMC** [1] uses the Macaulay bound and assumes the regularity of the system implicitly.
My own experiments indicate that this assumption is also _false_.
The authors of **Ciminion** [4] explicitly assume the derived system to be regular, but mistakenly describe this to be “the best adversarial scenario” where in fact the opposite is true.
Furthermore, my own experiments indicate that the polynomial sequence is _not_ regular.
For **Rescue** [2], the authors perform Gröbner basis attacks on round-reduced variants, showing that the system arising from Rescue is _not_ regular.
They then extrapolate the observed degrees to estimate the degree of regularity for the full-round primitive.

In summary, two approaches can be observed:
1. assume regularity of the system, then use the Macaulay bound to compute the degree of regularity, or
1. extrapolate the degree of regularity from round-reduced variants.
Both approaches then use the degree of regularity to estimate the complexity for computing the Gröbner basis.
This is generally done by looking at the complexity bound of the most efficient Gröbner basis algorithm, F<sub>5</sub>.
This bound is
{% katex(block="true") %}
O\left(\binom{n + d_\text{reg}}{n}^\omega\right)
{% end %}
where {% katex() %}n{% end %} is the number of variables in the polynomial ring [3].

But:
this is an upper bound.
We need a _lower_ bound.

# The Degree of Regularity does not Suffice

I'll make a series of increasingly complex and decreasingly pathological examples why the degree of regularity derived from the Macaulay bound does not suffice to accurately estimate the _concrete_ complexity of computing a Gröbner basis.
The ideals of all the systems below are of dimension 0, meaning that the respective sets of common solutions are non-empty and contain finitely many elements.
This accurately reflects the properties of polynomial systems modeling a cryptographic primitive.

## Example 1: The system is already a Gröbner basis

Let's say we want to compute the Gröbner basis for
{% katex() %}\mathcal{F}_\text{gb} = \{x^7, y^7, z^7\} \subseteq \mathbb{F}[x,y,z].{% end %}
We quickly see that {% katex() %}\mathcal{F}{% end %} is a [regular sequence](https://en.wikipedia.org/wiki/Regular_sequence), and determine that the degree of regularity is {% katex() %}d_\text{reg} = 1 + \sum_{i=0}^2 7 - 1 = 19.{% end %}
Consequently, or so the roughly sketched argument above goes, a Gröbner basis algorithm like F<sub>4</sub> or F<sub>5</sub> should have to perform computations on polynomials of up to degree 19 before being able to output a Gröbner basis.

However, {% katex() %}\mathcal{F}_\text{gb}{% end %} is already a Gröbner basis – no computation at all is required!

## Example 2: The system can be split up

Deriving a polynomial system from a cryptographic primitive rarely gives you a Gröbner basis – although there are exceptions, like GMiMC.
Instead, let's look at the following polynomial system.
{% katex(block="true") %}
\mathcal{F}_\text{indep} = \left\{
    \begin{aligned}
        &u^2 v w + u^2, && x^2 y z + x^2, \\
        &u v^2 w + v^2 + 1, && x y^2 z + y^2 + 1, \\
        &u v w^2 + w^2, && x y z^2 + z^2 \\
    \end{aligned}
\right\}
\subseteq \mathbb{F}[u,v,w,x,y,z].
{% end %}

The polynomials containing variables {% katex() %}u{% end %}, {% katex() %}v{% end %} and {% katex() %}w{% end %} are completely independent from the polynomials where {% katex() %}x{% end %}, {% katex() %}y,{% end %} and {% katex() %}z{% end %} make an appearance.
For the Macaulay bound, this fact is irrelevant.
Since {% katex() %}\mathcal{F}_\text{indep}{% end %} is a regular sequence, we might derive {% katex() %}d_\text{reg} = 1 + \sum_{i=0}^5 4 - 1 = 19.{% end %}

However, the F<sub>4</sub> implementations of [magma](http://magma.maths.usyd.edu.au/magma/) and [FGb](https://www-polsys.lip6.fr/~jcf/FGb/) as well as the [python implementation of F<sub>5</sub>](https://github.com/ASDiscreteMathematics/gb-voodoo/) all compute on polynomials of only degree 5 and lower before finding the Gröbner basis –
they are not fooled by this attempt to artificially increase the complexity.

## Example 3: The system is not very “involved”

When deriving a polynomial system from a (single) cryptographic primitive, a partition in the set of polynomials like above is unlikely to appear –
intuitively, that would lead to weak [diffusion](https://en.wikipedia.org/wiki/Confusion_and_diffusion#Diffusion).
Let's change the system a little, then.
{% katex(block="true") %}
\mathcal{F}_\text{invlv} = \left\{
    \begin{aligned}
        &u^2 v w + u^2, && x^2 y z + x^2, \\
        &u v^2 w + v^2 + 1, && x y^2 z + y^2 + 1, \\
        &u v w^2 + w^2, && u^4 + z^4 \\
    \end{aligned}
\right\}
\subseteq \mathbb{F}[u,v,w,x,y,z].
{% end %}

The sets {% katex() %}\mathcal{F}_\text{indep}{% end %} and {% katex() %}\mathcal{F}_\text{invlv}{% end %} differ in one polynomial, and this polynomial {% katex() %}(u^4 + z^4) = f_\text{link}{% end %} links the two independent subsets of {% katex() %}\mathcal{F}_\text{indep}.{% end %}
I didn't derive the system from any concrete primitive, but a polynomial like {% katex() %}f_\text{link}{% end %} might express how to move from one round to the next in a cipher.

The Macaulay bound for {% katex() %}\mathcal{F}_\text{invlv}{% end %} does not change from the bound for {% katex() %}\mathcal{F}_\text{indep}{% end %} since {% katex() %}f_\text{link}{% end %} is of the same degree as the polynomial it replaced.
Also, {% katex() %}\mathcal{F}_\text{invlv}{% end %} is still a regular sequence, so we still have {% katex() %}d_\text{reg} = 19.{% end %}

You might have guessed it by now:
the highest polynomials appearing during a Gröbner basis computation for {% katex() %}\mathcal{F}_\text{invlv}{% end %} is not 19.
Magma's F<sub>4</sub> reports a maximum degree of {% katex() %}6,{% end %} FGb only reaches degree 5, and so does python-F<sub>5</sub>.

While I don't fully understand why this happens, [vectors of origin](https://github.com/ASDiscreteMathematics/gb-voodoo/) give some hints.
Briefly, {% katex() %}v_i{% end %} is a vector of origin for Gröbner basis element {% katex() %}g_i{% end %} if {% katex() %}\mathcal{F}_\text{invlv} \cdot v_i = g_i.{% end %}
Below are the vectors of origin for {% katex() %}\mathcal{F}_\text{invlv},{% end %} where any big polynomial is replaced by {% katex() %}\bullet{% end %} to ease reading.
{% katex(block="true") %}
\begin{align*}
    v_1 &= (\bullet, \bullet, {\small 0}, {\small 0}, {\small 0}, {\small 0}), \\
    v_2 &= (\bullet, \bullet, {\small 0}, {\small 0}, {\small 0}, {\small 0}), \\
    v_3 &= ({\small 0}, {\small 0}, \bullet, 3, {\small 0}, {\small 0}), \\
    v_4 &= ({\small 0}, {\small 0}, \bullet, \bullet, {\small 0}, {\small 0}), \\
    v_5 &= ({\small 0}, {\small 0}, \bullet, \bullet, 1, {\small 0}), \\
    v_6 &= ({\small 0}, {\small 0}, \bullet, \bullet, \bullet, 1) \\
\end{align*}
{% end %}

A zero in position {% katex() %}i{% end %} in a vector of origin means that {% katex() %}f_i{% end %} was unnecessary for computing the Gröbner basis element.
Above vectors of origin have a lot of zeros –
in fact, even though all polynomials are linked to one another in some (potentially indirect) way, there seems to be a partition.

I describe polynomial systems for which the Gröbner bases' elements can be computed from a few input polynomials at a time as having low “involvement.”
As of yet, there is no mathematically rigourous way to define this notion, but above example should give a rough intuition.
My observations indicate that low involvement means low complexity for computing a Gröbner basis.

**Note.**
Above counter-examples do not disprove the equality of the degree of regularity and the Macaulay bound for _generic_ polynomial systems –
they only show that regularity of the sequence is not a sufficient requirement.

# Existing Lower Bounds

The main message of this post is that we need (tight-ish) _lower_, not upper, bounds for estimating the complexity of a Gröbner basis computation in order to accurately asses the security of cryptographic primitives against this vector of attack.
Unfortunately, the scientific literature currently has little to offer in this regard.

Hyun [5] exclusively deals with field {% katex() %}\mathbb{Q},{% end %} while we are interested in finite fields.
Möller & Mora [7] look at ideals of positive dimension, while we are only interested in zero-dimensional ideals.
Furthermore, all given bounds are _existential_ while we need a _constructive_ bound.

In summary, current strategies for arguing that some Arithmetization Oriented Primitive is resistant against Gröbner basis attacks make too many unbacked assumptions, often implicitly.
The tools to make these arguments rigorously don't currently exist.
Or in other words: “[look at me still talking when there's science to do.](https://www.youtube.com/watch?v=AgMLPFCFE90)”

# References

1. Albrecht, M.R., Grassi, L., Perrin, L., Ramacher, S., Rechberger, C., Rotaru, D.,Roy, A., Schofnegger, M.:
_Feistel Structures for MPC, and More_.
In: ESORICS. pp.151–171. Springer (2019)
1. Aly, A., Ashur, T., Ben-Sasson, E., Dhooghe, S., Szepieniec, A.:
_Design of Symmetric Primitives for Advanced Cryptographic Protocols_.
IACR ToSC 2020(3), 1–45(2020)
1. Bardet, M., Faugère, J.C., Salvy, B.:
_On the complexity of the F5 Gröbner basis algorithm_.
Journal of Symbolic Computation 70, 49–70 (2015)
1. Dobraunig, C.E., Grassi, L., Guinet, A., Kuijsters, D.:
_Ciminion: Symmetric Encryption Based on Toffoli-Gates over Large Finite Fields_.
In: Eurocrypt 2021 (2021)
1. Huynh, Dung T.:
_A superexponential lower bound for Gröbner bases and Church-Rosser commutative Thue systems_.
Information and Control, 68(1- 3):196–206 (1986)
1. Grassi, L., Khovratovich, D., Rechberger, C., Roy, A., Schofnegger, M.:
_Poseidon: A New Hash Function for Zero-Knowledge Proof Systems_.
In: USENIX Security. USENIXAssociation (2020)
1. Möller, H. M., and Mora, F.:
_Upper and lower bounds for the degree of Gröbner bases_.
In: International Symposium on Symbolic and Algebraic Manipulation, pages 172–183. Springer (1984)
