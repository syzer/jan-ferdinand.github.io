
document.getElementById("prime-as-product").addEventListener('click', e => {
    document.getElementById("prime-as-product").style.display = "none";
    document.getElementById("prime-as-sum").style.display = "initial";
})

document.getElementById("prime-as-sum").addEventListener('click', e => {
    document.getElementById("prime-as-sum").style.display = "none";
    document.getElementById("prime-as-prime").style.display = "initial";
})

document.getElementById("prime-as-prime").addEventListener('click', e => {
    document.getElementById("prime-as-prime").style.display = "none";
    document.getElementById("prime-as-product").style.display = "initial";
})
