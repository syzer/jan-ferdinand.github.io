+++
template = "post.html"
title = "Converting Gröbner bases with FGLM"
[taxonomies]
tags = ["Gröbner basis", "Term Order Change", "Algebra", "AS Dicrete Mathematics"]
+++

Have you ever computed a Gröbner basis in some monomial order $ hi $ ≺₀ only to then realize that you actually wanted it in another order ≺₁? I know, happens all the time… But fret not, FGLM can convert between the two orders, and you don't have to start your computation.

---

{% katex(block=true) %}
\sum_{i=0}^n a_ix^i
{% end %}

<!-- more -->
---

{% katex(block=false) %}
\sum_{i=0}^n a_ix^i
{% end %}

---

{% katex() %}
\sum_{i=0}^n a_ix^i
{% end %}
