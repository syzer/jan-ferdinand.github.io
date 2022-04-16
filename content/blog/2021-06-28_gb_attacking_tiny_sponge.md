+++
template = "post.html"
title = "Gröbner Basis-Attacking a Tiny Sponge"
[taxonomies]
tags = ["Algebra", "Gröbner basis", "Rescue-Prime", "Poseidon", "AS Discrete Mathematics"]
+++

| 🛈 |
| :- |
| I originally wrote this post when working at [AS Discrete Mathematics](https://asdm.gmbh) as part of a project sponsored by the [Ethereum Foundation](https://ethereum.foundation/). It is reproduced here with friendly permission. |

When estimating the security of a cipher or hash function, there are many different attack scenarios to consider.
For Arithmetization Oriented Ciphers (AOCs), Gröbner basis attacks are a lot more threatening than they are to “traditional” ciphers, like the AES.
The most common way to argue resistance against Gröbner basis attacks is to look at the expected complexity of Gröbner basis algorithms.

However, the complexity estimates only apply asymptotically, and the Big O notation might hide factors that are significant for parameter sizes a cipher designer is interested in.
Thus, to validate whether the theoretical complexity estimates carry significance, we need “real” data to compare it to.
This means running experiments – and that's exactly what this post is about.
Concretely, we have performed several Gröbner basis attacks, and will be discussing and interpreting the resulting data here.

## Disclaimer

Take below results with a grain of salt – the data might be wrong.
As far as I know, no one has reproduced it yet.
{% sidenote(label="efn_note") %}If you have run your own, comparable experiments, please [let me know](mailto:gb_attack@jfs.sh)!{% end %}
Please draw any conclusions carefully.

## Prerequisites

We assume a certain familiarity with the ciphers Rescue-Prime [[4]](#references) and Poseidon [[3]](#references), as well as the [Sponge construction](https://en.wikipedia.org/wiki/Sponge_function).
As a quick reminder for these three things, there are graphical depictions at the end of this post and in the next section, respectively.

Since this post is all about Gröbner basis attacks, a certain familiarity on this topic does not hurt, albeit it shouldn't be strictly necessary.
In case you want to brush up on a detail or two, have a look [here](https://ia.cr/2021/870).

# Description of Experiments

AOCs like Rescue-Prime and Poseidon are designed to have a “small” algebraic description.
That is, when polynomially modeling their structure, we don't need too many polynomials, and those are not of very high degree.

A use case where an AOC's simple algebraic description causes major speedups involves hashes in zero-knowledge proof systems.
The most popular way to transform a permutation, like Rescue-Prime or Poseidon, into a hash function is the Sponge construction.
On a high level, a Sponge looks like this:

{{ figure(src="/blog/2021-06-28_sponge.png", caption="Stylized depiction of the Sponge construction.") }}

Any cryptographic hash function needs to be secure against inversion, i.e., computing a pre-image for a given hash digest must be so difficult as to be infeasible.
For the Sponge construction, this largely depends on the plugged-in permutation.
For our experiments, we perform a second pre-image Gröbner basis attack on a Sponge construction with exactly one application of the permutation.
Furthermore, we set rate = capacity = 1, which is the lowest meaningful value for either parameter.
This way, we get the smallest Sponge one can build.
Consequently, if _this_ attack is infeasible, then Gröbner basis attacking a realistically sized Sponge definitely is.


{{ figure(src="/blog/2021-06-28_last_squeeze.png", caption="A super-tiny Sponge. Barely deserves the name.") }}

As the permutation, we use the two primitives Rescue-Prime and Poseidon with varying numbers of rounds.
The prime field has size p = 65519, which is the largest 16-bit prime for which gcd(p-1, 3) = 1, meaning we can use exponent 3 in the S-Boxes.
{% sidenote(label="largest_prime") %} For the largest 16-bit prime, i.e., 65521, we'd have to use exponent 11. {% end %}
The limitation to 16-bit primes comes from the used Gröbner basis computation implementation, namely [FGb](https://www-polsys.lip6.fr/~jcf/FGb/) [[2]](#references).

## Technical Specifications

All the experiments were performed using [cocalc](https://cocalc.com/) on an “n2-highmem-32 Cascade Lake Google Compute Engine” and 264141536 KiB (\~252 GiB) of total RAM as reported by `free`.
The operating system in use was (Ubuntu) Linux 5.4.0-1042-gcp x86_64 as reported by `uname -srm`

## Reproducibility

The code for the experiments can be found on [github](https://github.com/ASDiscreteMathematics/gb_benchmarks).
Its dependencies are [sagemath](https://www.sagemath.org/), [fgb_sage](https://github.com/mwageringel/fgb_sage), and [FGb](https://www-polsys.lip6.fr/~jcf/FGb/) [[2]](#references).
If you have the abilities and capacity to re-run the code to strengthen or refute the claims made here, I encourage you to do so.

# Summary of Results

Before looking at the data in a little more detail, here's a quick summary of some of my findings.

- We managed to compute a Gröbner basis for 6 rounds of Rescue-Prime, but failed at 7 rounds.
- Poseidon has a two types of rounds, which makes arguing about round limits a little more cumbersome.
  With the exception of one outlier, we could not break any partition totaling 11 rounds – see the matrix below.
- Memory, not time, seems to be the most limiting factor.
- The polynomial system for Poseidon appears to be *ir*regular, in contrast to the authors' implicit assumption.
  This directly affects the number of recommended rounds.
  For example, while Poseidon's authors recommend (8,9) rounds for p = 65519 and 2 elements in the state, extrapolating the data here suggests that (8,24) rounds might be necessary.
- The interpolation for the degree of regularity for Rescue-Prime is different from the interpolation published with Rescue, but similar in principle. This difference might be explained by the use of Rescue-_Prime_ as the permutation. Sadly, it neither validates nor refutes the authors' claims.

# Results in Detail

Experiments like the ones described above generate quite a bunch of data.
We're not gonna look at _everything_ here, I just want to highlight some parts.
If you want to start digging deeper, you can find the raw data at [the end of this post](#appendix-data).

The metric commonly used to estimate the complexity of a Gröbner basis computation is largely depending on the [degree of regularity](@/blog/2021-06-08_hilbert_reg.md).
{% sidenote(label="dreg") %}
In this post, I will be using ”degree of regularity“ and “maximum degree reached by F<sub>4</sub> during its execution” interchangeably.
Indeed, it is an open question whether this is always true.
{% end %}
This is [not based on a totally rigorous argument](https://asdm.gmbh/2021/05/18/dreg-insufficient-for-security/), but it seems to be “good enough” in practice.
Consequently, quite a bit of the following will be about the degree of regularity and the Macaulay bound.
{% sidenote(label="sok_gb") %}If you want to jog your memory on either of these concepts, I suggest taking a glance at [this document](https://ia.cr/2021/870).{% end %}
The Macaulay bound is an upper bound for the degree of regularity, and their values coincide if a polynomial system is a [regular sequence](https://en.wikipedia.org/wiki/Regular_sequence).

In general, the successful attacks that took the longest time for the two primitives were 6-round Rescue-Prime, and (full=2, partial=9)-round Poseidon.
They took around 34 and 73 hours, requiring roughly 75 and 228 GiB of memory, respectively.

## Rescue-Prime

We successfully computed a Gröbner basis for 6-round Rescue-Prime, but ran out of memory during the computation for 7-round Rescue-Prime.

### Degree of Regularity

The most important metric to consider is the growth of the degree of regularity as a function in the number of rounds.
As we can see, the degree of regularity is pretty consistently 2 less than the Macaulay bound of the polynomials system for Rescue-Prime.
The only exception happens at r = 2 rounds, an anomaly I don't believe deserves a lot of attention.

{{ figure(src="/blog/2021-06-28_rescue_prime_dreg_develop.png", caption="Various metrics of the polynomial system for Rescue-Prime as a function in the number of rounds.") }}

Interestingly, the degree of the highest degree polynomial in the resulting reduced Gröbner basis – abbreviated as the degree of the Gröbner basis – is even lower than that.
More importantly though, its growth seems to be only piecewise linear:
between 1 and 4 rounds, the degree of the Gröbner basis grows by 3 with each iteration, where from round 4 on, the difference is 4.

The limited number of data points makes drawing conclusions difficult.
However, it's not unreasonable to argue that extrapolating the degree of the Gröbner basis linearly might lead to inaccuracies.
Similarly, it is still an open question whether extrapolating the degree of regularity is a good method to estimate the complexity of computing the Gröbner basis for the full-round primitive.

The observed growth of the degree of regularity in Rescue-Prime is different from what is reported in the publication of “plain” Rescue.
Concretely, I observe
{% katex() %}d_\text{reg} \approx 4r-1 {% end %}
for Rescue-Prime, whereas Rescue's authors report
{% katex() %} d_\text{reg} = 2r+2 {% end %}
for Rescue [[1, Section 6.1]](#references).
Here is their figure for comparison:

{{ figure(src="/blog/2021-06-28_rescue_dreg_develop_original_paper.png", caption="Some of the same metrics as above for the polynomial system for Rescue as a function in the number of rounds, as given by the authors. [1]") }}

Extending this interpolation of the degree of regularity to an extrapolation can be used to estimate the required number of rounds to achieve a given security level.
For this, we use the known complexity bound for the most performant Gröbner basis algorithm, which is
{% katex() %} \binom{n + d_\text{reg}}{n}^\omega {% end %}.
Here, _n_ is the number of variables in the polynomial ring,
{% katex() %} d_\text{reg} {% end %}
is the degree of regularity, and _ω_ is the linear algebra constant.
A conservative choice for _ω_ is 2.
{% sidenote(label="lin-alg-constant") %}
I know of no Gröbner basis algorithm making use of sparse linear algebra techniques, which would imply _ω_ = 2.
However, it is plausible that they do or can exist.
{% end %}
For the used parameters of Rescue-Prime, the number of variables, which is equal to the number of equations, is 2r.
The degree of regularity is estimated to be 4r - 1.
Putting it all together, we have
{% katex() %} \binom{6r - 1}{2r}^2 > 2^{128} {% end %}
for r ≥ 13.
For the same parameters, the authors of Rescue-Prime recommend r = 27 [[4, Algorithm 7]](#references).
This recommendation also includes a security margin, and considers more attack vectors than just a Gröbner basis attack.

### F<sub>4</sub>'s Working Degree

For Rescue-Prime, the working degree of F<sub>4</sub> increases strictly monotonously:
every iteration of F<sub>4</sub>'s main loop means working with polynomials of degree exactly 1 higher than in the preceding iteration.
That makes for a pretty dull figure:

{{ figure(src="/blog/2021-06-28_rescue_prime_f4_degs.png", caption="For Rescue-Prime, F<sub>4</sub>'s working degree increases by 1 per iteration, independent of the number of rounds.") }}

## Poseidon

Since Poseidon has two types of rounds, namely full rounds and partial rounds, we have conducted a lot more experiments for Poseidon than for Rescue.
The following matrix summarizes which ones we ran, and whether the Gröbner basis could be computed successfully.
The value of a cell indicates how many polynomials the polynomial system had.
This is equal to the number of variables in the polynomial ring for this problem instance.
The number of full rounds differ across columns, the number of partial rounds across rows.

<table cellspacing="0" border="0">
  <colgroup span="7" width="1"></colgroup>
  <tr>
    <td></td>
    <td align="right">2</td>
    <td align="right">4</td>
    <td align="right">6</td>
    <td align="right">8</td>
    <td align="right">10</td>
    <td align="right">12</td>
  </tr>
  <tr>
    <td align="right">0</td>
    <td align="right" bgcolor="#5EB91E" style="color: #444;">3</td>
    <td align="right" bgcolor="#5EB91E" style="color: #444;">7</td>
    <td align="right" bgcolor="#5EB91E" style="color: #444;">11</td>
    <td align="right" bgcolor="#5EB91E" style="color: #444;">15</td>
    <td align="right" bgcolor="#5EB91E" style="color: #444;">19</td>
    <td align="right" bgcolor="#F10D0C" style="color: #444;">23</td>
  </tr>
  <tr>
    <td align="right">1</td>
    <td align="right" bgcolor="#5EB91E" style="color: #444;">4</td>
    <td align="right" bgcolor="#5EB91E" style="color: #444;">8</td>
    <td align="right" bgcolor="#5EB91E" style="color: #444;">12</td>
    <td align="right" bgcolor="#5EB91E" style="color: #444;">16</td>
    <td align="right" bgcolor="#F10D0C" style="color: #444;">20</td>
    <td></td>
  </tr>
  <tr>
    <td align="right">2</td>
    <td align="right" bgcolor="#5EB91E" style="color: #444;">5</td>
    <td align="right" bgcolor="#5EB91E" style="color: #444;">9</td>
    <td align="right" bgcolor="#5EB91E" style="color: #444;">13</td>
    <td align="right" bgcolor="#5EB91E" style="color: #444;">17</td>
    <td align="right" bgcolor="#F10D0C" style="color: #444;">21</td>
    <td></td>
  </tr>
  <tr>
    <td align="right">3</td>
    <td align="right" bgcolor="#5EB91E" style="color: #444;">6</td>
    <td align="right" bgcolor="#5EB91E" style="color: #444;">10</td>
    <td align="right" bgcolor="#5EB91E" style="color: #444;">14</td>
    <td align="right" bgcolor="#F10D0C" style="color: #444;">18</td>
    <td></td>
    <td></td>
  </tr>
  <tr>
    <td align="right">4</td>
    <td align="right" bgcolor="#5EB91E" style="color: #444;">7</td>
    <td align="right" bgcolor="#5EB91E" style="color: #444;">11</td>
    <td align="right" bgcolor="#5EB91E" style="color: #444;">15</td>
    <td align="right" bgcolor="#F10D0C" style="color: #444;">19</td>
    <td></td>
    <td></td>
  </tr>
  <tr>
    <td align="right">5</td>
    <td align="right" bgcolor="#5EB91E" style="color: #444;">8</td>
    <td align="right" bgcolor="#5EB91E" style="color: #444;">12</td>
    <td align="right" bgcolor="#F10D0C" style="color: #444;">16</td>
    <td></td>
    <td></td>
    <td></td>
  </tr>
  <tr>
    <td align="right">6</td>
    <td align="right" bgcolor="#5EB91E" style="color: #444;">9</td>
    <td align="right" bgcolor="#5EB91E" style="color: #444;">13</td>
    <td align="right" bgcolor="#E6E905" style="color: #444;">17</td>
    <td></td>
    <td></td>
    <td></td>
  </tr>
  <tr>
    <td align="right">7</td>
    <td align="right" bgcolor="#5EB91E" style="color: #444;">10</td>
    <td align="right" bgcolor="#F10D0C" style="color: #444;">14</td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
  </tr>
  <tr>
    <td align="right">8</td>
    <td align="right" bgcolor="#5EB91E" style="color: #444;">11</td>
    <td align="right" bgcolor="#F10D0C" style="color: #444;">15</td>
    <td></td>
    <td colspan=3 align="center" bgcolor="#5EB91E" style="color: #444">GB computed</td>
  </tr>
  <tr>
    <td align="right">9</td>
    <td align="right" bgcolor="#5EB91E" style="color: #444;">12</td>
    <td align="right" bgcolor="#E6E905" style="color: #444;">16</td>
    <td></td>
    <td colspan=3 align="center" bgcolor="#F10D0C" style="color: #444">out of memory</td>
  </tr>
  <tr>
    <td width="24" align="right">10</td>
    <td align="right" bgcolor="#F10D0C" style="color: #444;">13</td>
    <td></td>
    <td></td>
    <td colspan=3 align="center" bgcolor="#E6E905" style="color: #444">manually aborted</td>
  </tr>
</table>

A total of 11 rounds seems to the barrier we couldn't break with the available machine, the (2,9)-instance being a notable exception.
Note that the number of equations seems to not be the cutoff point – for (2,10)-Poseidon, we have 13 equations and variables but cannot compute the Gröbner basis, whereas for (10,0)-Poseidon with its 19 equations, we can compute the Gröbner basis.
For some of the figures below, we look at the series for
{% katex() %}r_\text{full} = 4 {% end %}
full rounds in more detail to simplify presentation.

### Degree of Regularity

As before, the degree of regularity is the metric we're interested in the most.
For example, for Poseidon (4,٭), i.e., 4 full rounds and a varying number of partial rounds, we get the following figure when plotting both the Macaulay bound and the system's degree of regularity.

{{ figure(src="/blog/2021-06-28_poseidon_f4_dreg_develop.png", caption="Degree of regularity and Macaulay bound of the polynomial system for (4,٭)-round Poseidon as a function in the number of partial rounds.") }}

It appears the degree of regularity is growing slower than the Macaulay bound.
For a more complete picture, the degrees of regularity for all successfully computed Gröbner bases are listed in the following table.
A grayed-out value means that the Gröbner basis computation did not terminate, but reached the indicated degree at its maximum before running out of memory or being aborted manually.

<table cellspacing="0" border="0">
  <colgroup span="7" width="85"></colgroup>
  <tr>
    <td></td>
    <td align="right">2</td>
    <td align="right">4</td>
    <td align="right">6</td>
    <td align="right">8</td>
    <td align="right">10</td>
    <td align="right">12</td>
  </tr>
  <tr>
    <td align="right">0</td>
    <td align="right" style="color: #444" bgcolor="#FFB66C">4</td>
    <td align="right" style="color: #444" bgcolor="#FFAA95">5</td>
    <td align="right" style="color: #444" bgcolor="#EC9BA4">6</td>
    <td align="right" style="color: #444" bgcolor="#BF819E">7</td>
    <td align="right" style="color: #444" bgcolor="#B7B3CA">8</td>
    <td align="right" style="color: #999">8</td>
  </tr>
  <tr>
    <td align="right">1</td>
    <td align="right" style="color: #444" bgcolor="#FFAA95">5</td>
    <td align="right" style="color: #444" bgcolor="#EC9BA4">6</td>
    <td align="right" style="color: #444" bgcolor="#EC9BA4">6</td>
    <td align="right" style="color: #444" bgcolor="#BF819E">7</td>
    <td align="right" style="color: #999">8</td>
    <td></td>
  </tr>
  <tr>
    <td align="right">2</td>
    <td align="right" style="color: #444" bgcolor="#FFAA95">5</td>
    <td align="right" style="color: #444" bgcolor="#EC9BA4">6</td>
    <td align="right" style="color: #444" bgcolor="#BF819E">7</td>
    <td align="right" style="color: #444" bgcolor="#B7B3CA">8</td>
    <td align="right" style="color: #999">8</td>
    <td></td>
  </tr>
  <tr>
    <td align="right">3</td>
    <td align="right" style="color: #444" bgcolor="#EC9BA4">6</td>
    <td align="right" style="color: #444" bgcolor="#BF819E">7</td>
    <td align="right" style="color: #444" bgcolor="#B7B3CA">8</td>
    <td align="right" style="color: #999">9</td>
    <td></td>
    <td></td>
  </tr>
  <tr>
    <td align="right">4</td>
    <td align="right" style="color: #444" bgcolor="#BF819E">7</td>
    <td align="right" style="color: #444" bgcolor="#B7B3CA">8</td>
    <td align="right" style="color: #444" bgcolor="#B4C7DC">9</td>
    <td align="right" style="color: #999">9</td>
    <td></td>
    <td></td>
  </tr>
  <tr>
    <td align="right">5</td>
    <td align="right" style="color: #444" bgcolor="#B7B3CA">8</td>
    <td align="right" style="color: #444" bgcolor="#B4C7DC">9</td>
    <td align="right" style="color: #999">9</td>
    <td></td>
    <td></td>
    <td></td>
  </tr>
  <tr>
    <td align="right">6</td>
    <td align="right" style="color: #444" bgcolor="#B4C7DC">9</td>
    <td align="right" style="color: #444" bgcolor="#B3CAC7">10</td>
    <td align="right" style="color: #999">10</td>
    <td></td>
    <td></td>
    <td></td>
  </tr>
  <tr>
    <td align="right">7</td>
    <td align="right" style="color: #444" bgcolor="#B3CAC7">10</td>
    <td align="right" style="color: #999">11</td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
  </tr>
  <tr>
    <td align="right">8</td>
    <td align="right" style="color: #444" bgcolor="#AFD095">11</td>
    <td align="right" style="color: #999">12</td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
  </tr>
  <tr>
    <td align="right">9</td>
    <td align="right" style="color: #444" bgcolor="#E8F2A1">12</td>
    <td align="right" style="color: #999">13</td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
  </tr>
  <tr>
    <td align="right">10</td>
    <td align="right" style="color: #999">13</td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
  </tr>
</table>

We can compute the Macaulay bound for the polynomial system arising from
{% katex() %}(r_\text{full}, r_\text{partial}){% end %}-Poseidon
as
{% katex() %} 4r_\text{full} + 2r_\text{part} - 1{% end %}.
A closely fitting linear approximation for the degree of regularity based on above data is
{% katex() %} d_\text{reg} \approx  \frac{r_\text{full}}{2} + r_\text{part} + 2 {% end %}.
The (limited) data suggests that the degree of regularity depends on a full round a lot less than the Macaulay bound makes it seem.
Overall, the degree of regularity does not stay very close to the Macaulay bound.

Based on the [script](https://extgit.iaik.tugraz.at/krypto/hadesmimc/-/blob/master/code/calc_round_numbers.py) supplied by the authors of Poseidon, the recommended number of rounds for 128 bits of security when using a state size of 2 is (8, 9).
Using the number of full rounds as a given, and plugging the interpolated degree of regularity, i.e., r + 6, and the required number of variables, i.e., r + 15, into the complexity bound for the most performant Gröbner basis algorithm leads us to the conclusion that r ≥ 24 partial rounds are necessary to achieve 128 bits of security against Gröbner basis attacks, i.e.,
{% katex() %} \binom{2r+21}{r+15}^2 > 2^{128} {% end %}
for r ≥ 24.
This discrepancy is the direct consequence of the observed degree of regularity not equaling the Macaulay bound – plugging the Macaulay bound into the same formula results in r ≥ 10.

### F<sub>4</sub>'s Working Degree

The working degree of F<sub>4</sub> is quite “bouncy” for the polynomial systems derived from Poseidon.
For example, for
{% katex() %} r_\text{full} = 4 {% end %}
with varying number of partial rounds, we can plot the working degree of F<sub>4</sub> against the iteration that degree occurred in.
While the overall tendency is “up,” there are many iterations for which the working degree does not change, or even drops.
I am unsure what exactly this means in terms of security, or if it means anything at all.

{{ figure(src="/blog/2021-06-28_poseidon_4_f4_degs.png", caption="For Poseidon, F<sub>4</sub>'s working degree develops… interestingly.") }}

# Comparison: Rescue-Prime vs Poseidon {#comparison}

One of the most notable differences between the polynomial systems for Rescue-Prime and Poseidon is the growth rate of their respective degrees of regularity.
For example, consider the following plot, where I have repeated the data for Rescue-Prime from above and added the Macaulay bound and degree of regularity for (٭,0)-Poseidon, i.e., varying the number of full rounds.

{{ figure(src="/blog/2021-06-28_mac-bound_f4-deg_comparison.png", caption="
  For Rescue-Prime, the degree of regularity closely matches the Macaulay bound.
  For Poseidon, the Macaulay bound vastly overestimates the actual degree of regularity.
") }}

While the Macaulay bounds are almost identical, the observed degrees of regularity differ greatly.

It's also nice to see the development of the used memory for a few instances, even though that comparison is not very important.
Below figure shows the required memory over time for 5, 6, and 7-round Rescue-Prime and (4,5), (4,6), (4,7)-round Poseidon.
Recall that 7-round Rescue-Prime and (4,7)-round Poseidon both ran out of memory, i.e., terminated abnormally.

{{ figure(src="/blog/2021-06-28_memory_vs_time.png", caption="Not significant but interesting: memory consumption over time for various polynomial systems.") }}

By the jumps in memory consumption you can pretty clearly see where a new, bigger matrix was constructed.
This corresponds to the iterations of F<sub>4</sub>.
Exponential – or binomial – growth being what it is, it does not make sense to plot instances with less rounds.
Already, 5-round Rescue-Prime and (4,5)-round Poseidon are barely visible in the lower-left corner of the figure.
The dotted line corresponds to the total available memory.

# Conclusion

The data suggests that the implicit assumption about the regularity of the polynomial system arising from Poseidon is wrong:
the difference between the Macaulay bound and the observed degree of regularity implies that the system is irregular.
This has direct consequences for the minimum number of rounds required to achieve a target security level.
For example, for p = 65519 and state size 2, we recommend (8,24) rounds as opposed to (8,9) rounds.

An interesting open question is how to interpret the “bounciness” of F<sub>4</sub>'s working degree when computing a Gröbner basis for a Poseidon-derived system.
The significance of this behavior is completely unclear.

Another open question regards the discrepancy in the observed growth of the degree of regularity for Rescue and Rescue-Prime.
Regardless, the data supports the security argument of Rescue-Prime:
adding one half round at either end, i.e., transforming “plain” Rescue into Rescue-Prime, does not seem to decrease security.

All things told, no successful Gröbner basis attack could be performed for anything approaching realistic round numbers – even for this tiny Sponge construction.

# References

1. Aly, A., Ashur, T., Ben-Sasson, E., Dhooghe, S., Szepieniec, A.:
_Design  of Symmetric Primitives for Advanced Cryptographic Protocols_.
IACR ToSC  2020(3), 1–45 (2020)
1. J.-C. Faugère:
_FGb: A Library for Computing Gröbner Bases_.
In Komei Fukuda, Joris Hoeven, Michael Joswig, and Nobuki Takayama, editors, Mathematical Software ICMS 2010, volume 6327 of Lecture Notes in Computer Science, pages 84-87, Berlin, Heidelberg, September 2010.
Springer Berlin / Heidelberg.
1. Grassi, L., Khovratovich, D., Rechberger, C., Roy, A., Schofnegger, M.:
_Poseidon: A New Hash Function for Zero-Knowledge Proof Systems_.
In: USENIX Security. USENIX Association (2020)
1. Szepieniec, A., Ashur, T., Dhooghe, S.:
_Rescue-Prime: a Standard Specification (SoK)_.
Cryptology ePrint Archive, Report 2020/1143 (2020)

# Appendix – Summary of the Hash Functions {#appendix-summary}

Below, I have put some figures summarizing the AOCs Rescue-Prime and Poseidon, respectively.
The input, output, and constants are all vectors of the same length.
They are contracted here to simplify presentation.

{{ figure(src="/blog/2021-06-28_rescue_prime.png", caption="2-round Rescue-Prime. Note that a single round, made up of two half rounds, first uses exponent 3 and then ⅓.") }}

{{ figure(src="/blog/2021-06-28_poseidon.png", caption="(2,1)-round Poseidon, i.e., the instance has 2 full rounds – 1 at the beginning, 1 at the end – and 1 partial round.") }}

# Appendix – Raw Data {#appendix-data}

[Here's the data](2021-06-28_last_squeeze_attack_data.zip) this post is based on!
Each experiment, say, (4,3)-Poseidon, comes with 4 files:
{% sidenote(label="spaces") %}Yes, there are spaces in the filename. 🤦 Sorry.{% end %}

<dl>
  <dt><strong><code>poseidon_65519_(4, 3)_fgb_debug.txt</code></strong></dt>
  <dd>debug information of FGb, described on page 12 in <a href="https://www-polsys.lip6.fr/~jcf/FGb/C/Cdoc.pdf">this document</a>.</dd>
  <br>
  <dt><strong><code>poseidon_65519_(4, 3)_mem.txt</code></strong></dt>
  <dd>memory requirements over time, in KiB, one row per second.</dd>
  <br>
  <dt><strong><code>poseidon_65519_(4, 3)_summary.txt</code></strong></dt>
  <dd>includes time & memory measurements, degrees, data from FGb.</dd>
  <br>
  <dt><strong><code>poseidon_65519_(4, 3)_sys.txt</code></strong></dt>
  <dd>the polynomial system for which the Gröbner basis was computed.</dd>
</dl>

