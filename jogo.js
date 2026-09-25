(function(){
  "use strict";

  var ROUNDS = [
    {
      title: "Espaços da cidade",
      pairs: [
        { emojis: ["🏙️","🌳"], answer: "Parque Urbano" },
        { emojis: ["🏗️","🏠"], answer: "Déficit Habitacional" },
        { emojis: ["🏛️","📜"], answer: "Patrimônio Histórico" }
      ]
    },
    {
      title: "Mobilidade urbana",
      pairs: [
        { emojis: ["🚆","🚏"], answer: "Transporte Público" },
        { emojis: ["🚗","🚦"], answer: "Trânsito Urbano" },
        { emojis: ["🚲","🚶"], answer: "Mobilidade Ativa" }
      ]
    },
    {
      title: "Sustentabilidade",
      pairs: [
        { emojis: ["♻️","🗑️"], answer: "Gestão de Resíduos" },
        { emojis: ["💧","🚰"], answer: "Recursos Hídricos" },
        { emojis: ["💡","☀️"], answer: "Energia Renovável" }
      ]
    },
    {
      title: "Meio ambiente",
      pairs: [
        { emojis: ["🏭","🌫️"], answer: "Poluição do Ar" },
        { emojis: ["🌍","🌡️"], answer: "Aquecimento Global" },
        { emojis: ["🐝","🌳"], answer: "Biodiversidade Urbana" }
      ]
    },
    {
      title: "Planejamento urbano",
      pairs: [
        { emojis: ["🏞️","🧘"], answer: "Área de Lazer" },
        { emojis: ["🏗️","📈"], answer: "Expansão Urbana" },
        { emojis: ["🏘️","📋"], answer: "Zoneamento Urbano" }
      ]
    },
    {
      title: "Cidadania e cidade",
      pairs: [
        { emojis: ["🗳️","🏛️"], answer: "Participação Cidadã" },
        { emojis: ["👥","🏠"], answer: "Inclusão Social" },
        { emojis: ["🚨","🏙️"], answer: "Segurança Pública" }
      ]
    }
  ];

  var state = {
    roundIndex: 0,
    score: 0,
    selectedPairId: null,
    bankOrder: [],
    solvedCount: 0
  };

  var els = {
    card: document.getElementById("game-card"),
    roundPill: document.getElementById("round-pill"),
    scorePill: document.getElementById("score-pill"),
    progressFill: document.getElementById("progress-fill"),
    toast: document.getElementById("toast"),
    heading: document.getElementById("round-heading")
  };

  function shuffle(arr){
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--){
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function showToast(text, kind){
    els.toast.textContent = text;
    els.toast.className = "feedback-toast show" + (kind ? " " + kind : "");
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(function(){
      els.toast.classList.remove("show");
    }, 1400);
  }

  function updateStatusRow(){
    var total = ROUNDS.length;
    els.roundPill.textContent = "Rodada " + (state.roundIndex + 1) + " de " + total;
    els.scorePill.textContent = "Pontos: " + state.score;
    var pct = Math.round(((state.roundIndex) / total) * 100 + (state.solvedCount / 3) * (100/total));
    els.progressFill.style.width = Math.min(pct, 100) + "%";
  }

  function renderRound(){
    var round = ROUNDS[state.roundIndex];
    state.selectedPairId = null;
    state.solvedCount = 0;
    state.bankOrder = shuffle(round.pairs.map(function(p, i){ return i; }));

    els.heading.textContent = "Rodada " + (state.roundIndex + 1) + ": " + round.title;

    var html = "";
    html += '<h2 class="round-title"><span class="num">RODADA ' + (state.roundIndex+1) + '/' + ROUNDS.length + '</span>' + round.title + '</h2>';
    html += '<p class="round-instructions">Clique em uma combinação de emojis e depois no termo correspondente no banco de palavras.</p>';
    html += '<div class="board">';
    html += '<div class="pairs-col" id="pairs-col">';
    round.pairs.forEach(function(pair, i){
      html += '' +
        '<button type="button" class="pair-card" data-pair-id="' + i + '" aria-pressed="false">' +
          '<span class="emoji-combo" aria-hidden="true">' +
            '<span>' + pair.emojis[0] + '</span><span class="plus">+</span><span>' + pair.emojis[1] + '</span>' +
          '</span>' +
          '<span class="pair-answer-slot">' +
            '<span class="eq">=</span>' +
            '<span class="blank" data-blank-id="' + i + '"></span>' +
          '</span>' +
          '<span class="check-icon" aria-hidden="true">&#10003;</span>' +
        '</button>';
    });
    html += '</div>';
    html += '<div class="bank-col">';
    html += '<p class="bank-title">Banco de palavras</p>';
    html += '<ul class="bank-list" id="bank-list">';
    state.bankOrder.forEach(function(pairIdx){
      html += '<li><button type="button" class="bank-term" data-answer-for="' + pairIdx + '">' + round.pairs[pairIdx].answer + '</button></li>';
    });
    html += '</ul>';
    html += '<p class="bank-hint">Restam <strong id="remaining-count">3</strong> termos nesta rodada.</p>';
    html += '</div>';
    html += '</div>';

    els.card.innerHTML = html;
    updateStatusRow();
    attachRoundHandlers();
  }

  function attachRoundHandlers(){
    var pairCards = els.card.querySelectorAll(".pair-card");
    var bankTerms = els.card.querySelectorAll(".bank-term");

    pairCards.forEach(function(card){
      card.addEventListener("click", function(){
        if (card.classList.contains("correct")) return;
        pairCards.forEach(function(c){
          c.classList.remove("selected");
          c.setAttribute("aria-pressed", "false");
        });
        card.classList.add("selected");
        card.setAttribute("aria-pressed", "true");
        state.selectedPairId = parseInt(card.getAttribute("data-pair-id"), 10);
      });
    });

    bankTerms.forEach(function(term){
      term.addEventListener("click", function(){
        if (term.hasAttribute("disabled")) return;
        if (state.selectedPairId === null){
          showToast("Selecione primeiro uma combinação de emojis", "error-toast");
          return;
        }
        var answerFor = parseInt(term.getAttribute("data-answer-for"), 10);
        var pairCard = els.card.querySelector('.pair-card[data-pair-id="' + state.selectedPairId + '"]');

        if (answerFor === state.selectedPairId){
          handleCorrect(pairCard, term, answerFor);
        } else {
          handleWrong(pairCard, term);
        }
      });
    });
  }

  function handleCorrect(pairCard, term, pairIdx){
    var round = ROUNDS[state.roundIndex];
    var blank = pairCard.querySelector('[data-blank-id="' + pairIdx + '"]');
    blank.textContent = round.pairs[pairIdx].answer;
    blank.classList.add("filled");
    pairCard.classList.remove("selected");
    pairCard.classList.add("correct");
    pairCard.setAttribute("aria-pressed", "true");
    pairCard.setAttribute("disabled", "true");

    term.setAttribute("disabled", "true");

    state.score += 10;
    state.solvedCount += 1;
    state.selectedPairId = null;

    var remainingEl = els.card.querySelector("#remaining-count");
    if (remainingEl) remainingEl.textContent = String(3 - state.solvedCount);

    showToast("Certo! +10 pontos", "success-toast");
    updateStatusRow();

    if (state.solvedCount >= round.pairs.length){
      window.setTimeout(advanceRound, 900);
    }
  }

  function handleWrong(pairCard, term){
    state.score = Math.max(0, state.score - 2);
    pairCard.classList.add("shake");
    term.classList.add("wrong-flash");
    window.setTimeout(function(){
      pairCard.classList.remove("shake");
      term.classList.remove("wrong-flash");
    }, 400);
    showToast("Não foi dessa vez, tente novamente", "error-toast");
    updateStatusRow();
  }

  function advanceRound(){
    if (state.roundIndex < ROUNDS.length - 1){
      state.roundIndex += 1;
      renderRound();
    } else {
      renderEnd();
    }
  }

  function renderEnd(){
    var maxScore = ROUNDS.length * 3 * 10;
    els.heading.textContent = "Fim de jogo";
    els.roundPill.textContent = "Concluído";
    els.progressFill.style.width = "100%";

    var pct = Math.round((state.score / maxScore) * 100);
    var message;
    if (pct >= 90) message = "Especialista em urbanização! Domínio completo dos conceitos.";
    else if (pct >= 70) message = "Muito bom! Você entende bem os temas urbanos.";
    else if (pct >= 40) message = "Bom começo. Revise os conceitos e tente de novo.";
    else message = "Vale a pena jogar novamente para fixar os termos.";

    els.card.innerHTML =
      '<div class="end-screen">' +
        '<p class="bank-title" style="margin:0;">Resultado final</p>' +
        '<p class="big-score">' + state.score + ' / ' + maxScore + '</p>' +
        '<p>' + message + '</p>' +
        '<div class="end-actions">' +
          '<button type="button" class="btn btn-primary" id="restart-btn">Jogar novamente</button>' +
        '</div>' +
      '</div>';

    document.getElementById("restart-btn").addEventListener("click", function(){
      state.roundIndex = 0;
      state.score = 0;
      renderRound();
    });
  }

  renderRound();
})();
