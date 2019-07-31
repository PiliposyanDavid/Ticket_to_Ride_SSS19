import './endgame.css';
import {qs, addClass, removeClass} from '../../libs/dom';
import {listen} from '../../libs/events';
import IO from '../communications/IO';
import Score from './Score';


export default class Endgame {

    constructor(game) {
        this.game = game;
        //this.debugScore();

        this.el = document.getElementById('endgame');
    }


    render() {
        IO.emit('Endgame.score', this.game)
            .then(response => {
                console.log(response);
                this.score = new Score(response.body);
                this.score.render();
                this.theWinnerIs();
            });
        listen(qs('.close', this.el), 'click', this.close);
    }


    theWinnerIs() {
        this.score.theWinnerIs();
        removeClass(this.el, 'hidden');
    }


    close = () => {
        IO.emit('Endgame.close', this.game)
            .then(response => {
                console.log(response);
                addClass(this.el, 'hidden');
            });
    };


    debugScore() {
        this.players = [
            {
                id: '11111',
                name: 'Player 1',
                points: 35,
                destinations: [
                    {
                        id: '33333',
                        name: 'Tovuz - Abovyan',
                        points: 15,
                        completed: true,
                    },
                ],
            },
            {
                id: '22222',
                name: 'Player 2',
                points: 81,
                destinations: [
                    {
                        id: '66666',
                        name: 'Tovuz - Abovyan',
                        points: 15,
                        completed: false,
                    },
                ],
            },
            {
                id: '33333',
                name: 'Player 3',
                points: 57,
                destinations: [
                    {
                        id: '99999',
                        name: 'Tovuz - Abovyan',
                        points: 15,
                        completed: false,
                    },
                ],
            },
            /*{
              id: '44444',
              name: 'Player 4',
              points: 40,
            },
            {
              id: '55555',
              name: 'Player 5',
              points: 69,
            },*/
        ];
    }

}
