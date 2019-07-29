import './game.css';
import { qs, qsa, addClass, removeClass } from '../../libs/dom';
import IO from '../communications/IO';
import Message from '../communications/Message';
import Board from '../board/Board';
import Lobby from '../lobby/Lobby';
import Deck from '../deck/Deck';
import DestinationDeck from '../deck/DestinationDeck';
import Endgame from '../endgame/Endgame';
import Pile from '../pile/Pile';
import Player from '../player/Player';


class Game {


  constructor() {
    this.room = {};
    this.turn = 0;
    this.activePlayer = {};
    this.deck = {};
    this.destinations = {};
    this.pile = {};
    this.board = new Board();

    this.el = {
      game: document.getElementById('game'),
      info: document.getElementById('info'),
    };
    this.el.turn = qs('.turn .count', this.el.info);
    this.el.players = qs('.players', this.el.info);
  }


  listen() {
    IO.io.on('Game.start', this.start);
    IO.io.on('Game.closed', this.close);
    IO.io.on('Game.updated', this.update);
    IO.io.on('Game.turnChanged', this.changeTurn);
  }


  simplify() {
    return {
      id: this.room.id,
      turn: this.turn,
      activePlayer: this.activePlayer,
    };
  }


  start = response => {
    this.room = response.body.room;
    this.turn = 0;
    this.deck = new Deck(response.body.deck.cards.length);
    this.destinations = new DestinationDeck(response.body.destinations.cards.length);
    this.pile = new Pile();
    this.board.render();

    Lobby.hide();

    this.activePlayer = response.body.activePlayer;
    Player.setColor(this.room.players.find(p => p.id === Player.id).color);
    Player.initHand();
    Player.initDestinations();
    Player.startTurn(this.activePlayer);

    this.render();
  }


  debugBoard() {
    this.board.render();
    Lobby.hide();
    removeClass(this.el.game, 'hidden');
  }


  close = response => {
    if (Object.keys(this.room).length) {
      Message.error(response.message);
    }
    addClass(this.el.game, 'hidden');
    this.room = {};
    this.turn = 0;
    Lobby.show();
  }


  render() {
    this.el.turn.textContent = this.turn;

    while (this.el.players.firstChild) {
      this.el.players.removeChild(this.el.players.firstChild);
    }
    for (const player of this.room.players) {
      this.el.players.insertAdjacentHTML('beforeend', `
        <div class="player" data-player-id="${player.id}">
          <div class="name ${player.color}">${player.name}</div>
          <div class="points">
            <span class="count">${player.points}</span>
            <span class="icon"></span>
          </div>
          <div class="pieces">
            <span class="count">${player.pieces}</span>
            <span class="icon"></span>
          </div>
          <div class="cards">
            <span class="count">${player.cards}</span>
            <span class="icon"></span>
          </div>
          <div class="destinations">
            <span class="count">${player.destinations}</span>
            <span class="icon"></span>
          </div>
        </div>
      `);
    }
    removeClass(this.el.game, 'hidden');

    this.toggleTurnActivation();
  }


  update = response => {
    const game = response;

    if (game.turn !== this.turn) {
      this.turn = game.turn;
      this.el.turn.textContent = this.turn;
    }

    for (const player of this.room.players) {
      const gamePlayer = game.players.find(p => p.id === player.id);
      const playerElem = qs(`.player[data-player-id="${player.id}"]`);

      if (gamePlayer.id === Player.id) {
        Player.points = gamePlayer.points;
        Player.pieces = gamePlayer.pieces;
      }

      if (player.points !== gamePlayer.points) {
        player.points = gamePlayer.points;
        qs('.points .count', playerElem).textContent = player.points;
      }
      if (player.cards !== gamePlayer.cards) {
        player.cards = gamePlayer.cards;
        qs('.cards .count', playerElem).textContent = player.cards;
      }
      if (player.pieces !== gamePlayer.pieces) {
        player.pieces = gamePlayer.pieces;
        qs('.pieces .count', playerElem).textContent = player.pieces;
      }
      if (player.destinations !== gamePlayer.destinations.length) {
        player.destinations = gamePlayer.destinations.length;
        qs('.destinations .count', playerElem).textContent = player.destinations;
      }
    }

    this.toggleTurnActivation();
  }


  changeTurn = response => {
    this.activePlayer = response.body.player;

    if (response.body.turn !== 'endgame') {
      Player.startTurn(this.activePlayer);
    } else {
      const endgame = new Endgame(this.room.id);
      endgame.render();
      //endgame.theWinnerIs();
    }
    Message.success(response.message);
  }


  toggleTurnActivation() {
    const players = qsa('.player', this.el.players);
    [...players].forEach(player => {
      if (player.dataset.playerId === this.activePlayer.id) {
        addClass(player, 'active');
      } else {
        removeClass(player, 'active');
      }
    });
    if (Player.id === this.activePlayer.id) {
      addClass(this.el.game, 'active');
    } else {
      removeClass(this.el.game, 'active');
    }
  }

}


export default new Game();
