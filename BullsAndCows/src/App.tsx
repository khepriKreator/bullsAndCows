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
    isError: boolean;
    errorMessage?: string;
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
    isError: boolean = false;
    errorMessage: string = '';
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
        if (!this.isValidAnswer(answer)) {
            return 'Invalid answer';
        }
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
        if (this.isError) {
            this.gameLog.push({answer: this.answer, errorMessage: this.errorMessage, isError: this.isError})
            return null;
        }
        this.gameLog.push({answer: this.answer, bulls: this.bulls, cows: this.cows, tries: this.tries, isError: false})
    }

    resetGameLog() {
        this.gameLog.splice(0, this.gameLog.length);
    }
    isAnswerHasDuplicates(answer: number[]) {
        const result: boolean[] = [];
        answer.map((n, i) => {
            result.push(answer.includes(n, i + 1));
        })
        return result.includes(true);
    }
    isValidAnswer(answer: number[]): boolean {
        if (answer.includes(NaN)) {
            this.isError = true;
            this.errorMessage = 'Invalid answer'
            return false;
        }
        if (answer.length < 4) {
            this.isError = true;
            this.errorMessage = 'Invalid number'
            return false;
        }
        if (this.isAnswerHasDuplicates(answer)) {
            this.isError = true;
            this.errorMessage = 'Number has duplicates';
            return false;
        }
        return true;
    }
    resetCount() {
        this.bulls = 0;
        this.cows = 0;
        this.answer = 0;
        this.errorMessage = '';
        this.isError = false;
    }
}

const gameStore = new GameStore();
const StartWindow = () => {
    return (
        <div className={'start'}>
        <Link
            to={'/game'}
            className={'link'}
        >
            Start
        </Link>
        </div>
    )
}

const GameLog = () => {
    return (
                <div className={'gameLog'}>
                    <div><strong>Console</strong></div>
                    {
                        gameStore.gameLog.map((item, index) => <p key={index}>Answer: {item.answer}, {item.isError ? `Message: ${item.errorMessage}` : `Bulls: ${item.bulls}, Cows: ${item.cows}, Tries: ${item.tries}`}</p>)
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
        gameStore.answer = Number(inputValue);
        const answer = Array.from(inputValue, Number);
        if (answer.length !== 0) setResult(gameStore.compareNumbers(answer));
        if (gameStore.bulls === 4) {
            navigate('/win');
        }
        gameStore.pushResultToGameLog();
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
        <div className={'win'}>
            <h1 >You win!</h1>
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