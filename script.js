document.addEventListener("DOMContentLoaded", function () {
    let botao = document.querySelector("#botaoLogin");

    botao.addEventListener("click", function (event) {
        let email = document.querySelector("#email").value.trim();
        let senha = document.querySelector("#senha").value.trim();

        // Se algum campo estiver vazio, bloqueia a navegação da âncora
        if (email === "" || senha === "") {
            event.preventDefault(); // Impede de ir para inicio.html
            alert("Preencha o email e a senha!");
        }
       
    });
});