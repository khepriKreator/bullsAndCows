import {observer} from "mobx-react-lite";
import {action, makeObservable, observable} from "mobx";
import {useEffect, useState} from "react";
import './App.css'
import {createBrowserRouter, Link, RouterProvider, useNavigate} from "react-router-dom";

type GameLog = {
    answer: number;
    bulls?: number;
    cows?: number;
    tries?: number;
    invalid?: string;
}
const getRandomNumber = (min?: number) => {
    let number = Math.floor(Math.random() * 10);
    if (min) {
        while (number < min) {
            number = Math.floor(Math.random() * 10)
        }
        return number;
    }
    return number;
}
class GameStore {
    hiddenNumber: number[] = [];
    cows: number = 0;
    bulls: number = 0;
    answer: number = 0;
    tries: number = 0;
    validationError: string = '';
    gameLog:    Array<GameLog> = [];
    constructor() {
        makeObservable(this, {
            hiddenNumber: observable,
            bulls: observable,
            compareNumbers: action,
        })
    }
    generateUniqueNumber() {
        this.hiddenNumber.splice(0,4);
        this.resetCount();
        for (let i = 0; this.hiddenNumber.length < 4 ; i++) {
            if (this.hiddenNumber.length === 0) {
                this.hiddenNumber.push(getRandomNumber(1))
            }
            else
            {
                let number = getRandomNumber();
                while (this.hiddenNumber.indexOf(number) !== -1) {
                    number = getRandomNumber()
                }
                this.hiddenNumber.push(number);
            }
        }
        console.log(this.hiddenNumber)
    }
    compareNumbers(answer: number[]) {
        this.answer = Number(answer.join(''))
        this.tries++;
        answer.forEach((numb, i) => {
            if (this.hiddenNumber.indexOf(numb) !== -1) {
                this.hiddenNumber.indexOf(numb) === i ? this.bulls++ : this.cows++;
            }
        })
        return `Your answer has ${this.bulls} bull(s) and ${this.cows} cow(s)!`
    }
    pushResultToGameLog() {
        this.gameLog.push({answer: this.answer, bulls: this.bulls, cows: this.cows, tries: this.tries})
    }

    resetGameLog() {
        this.gameLog.splice(0, this.gameLog.length);
    }
    isValidAnswer(answer: number[]): boolean {
        if (NaN) {
            this.validationError = 'Invalid answer'
            return false;
        }
        if (answer.length > 4 || answer.length < 4) {
            this.validationError = 'Invalid number'
            return false
        }
        if (!answer.every((n, i) => answer.indexOf(n, i + 1) !== -1)) {
            this.validationError = 'The number has repetitions'
            return false;
        }
        return true;
    }
    resetCount() {
        this.bulls = 0;
        this.cows = 0;
        this.answer = 0;
        this.validationError = '';
    }
}

const gameStore = new GameStore();
console.log(gameStore.isValidAnswer([4321]))
const StartWindow = () => {
    return (
        <Link
            to={'/game'}
            className={'link'}
        >
            Start
        </Link>
    )
}

const GameLog = () => {
    return (
                <div className={'gameLog'}>
                    <div><strong>Console</strong></div>
                    {
                        gameStore.gameLog.map((item, index) => <p key={index}>Answer: {item.answer}, Bulls: {item.bulls}, Cows: {item.cows}, Tries: {item.tries}</p>)
                    }
                </div>
    )
}

const GameInterface = observer(() => {
    const [inputValue, setInputValue] = useState('');
    const [result, setResult] = useState('');
    const navigate = useNavigate()
    useEffect(() => {
        gameStore.generateUniqueNumber();
        gameStore.resetGameLog();
    }, [])
    const handleSubmit = () => {
        const answer = Array.from(inputValue, Number);
        if (answer.length !== 0) setResult(gameStore.compareNumbers(answer));
        if (gameStore.bulls === 4) {
            navigate('/win');
        }
        gameStore.pushResultToGameLog()
    }
    return (
        <div className={'gameWindow'}>
            <div className={'gameInterface'}>
                <img className={'image'} src={'../public/image.jpg'} alt={'bull&cow'}/>
                <input
                    className={'input'}
                    type={'text'}
                    maxLength={4}
                    minLength={4}
                    value={inputValue}
                    onChange={(event) => {
                        gameStore.resetCount()
                        setResult('')
                        setInputValue(event.target.value)
                    }}
                />
                <button
                    onClick={handleSubmit}
                >
                    Answer
                </button>
                <p
                    className={'result'}
                >{(result !== '') && result}</p>
            </div>
            <GameLog/>
        </div>
    )
})

const WinWindow = () => {
    return (
        <div>
            <h1 className={'win'}>You win!</h1>
            <Link to={'/game'} className={'link'}>
                New game
            </Link>
        </div>
    )
}

const routerConfig = createBrowserRouter([
    {
        path: '/',
        element: <StartWindow/>
    },
    {
        path: '/game',
        element: <GameInterface/>
    },
    {
        path: 'win',
        element: <WinWindow/>
    }
])

const App = observer(() => {

  return (
    <div className={'gameWindow'}>
        <RouterProvider router={routerConfig}/>
    </div>
  )
})
export default App