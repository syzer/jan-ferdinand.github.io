+++
template = 'home.html'
+++

<br><br><br>

<p id="prime-as-product" style="display: initial;">
{% katex(block="true") %}
\Large 2^{2^5} \cdot \smash{\prod_{i=0}^4\left( 2^{2^i} + 1 \right) + 1}
{% end %}
</p>
<p id="prime-as-sum" style="display: none;">
{% katex(block="true") %}
\Large 2^{64} - 2^{32} + 1
{% end %}
</p>
<p id="prime-as-prime" style="display: none;">
{% katex(block="true") %}
\Large 18\,446\,744\,069\,414\,584\,321
{% end %}
</p>
