import {observer} from "mobx-react-lite";
import {action, makeObservable, observable} from "mobx";
import {useEffect, useState} from "react";
import './App.css'
import {createBrowserRouter, Link, RouterProvider, useNavigate} from "react-router-dom";

type Error = {
    isError: boolean;
    message: string;
}

type GameLog = {
    answer: number;
    bulls: number;
    cows: number;
    tries: number;
    error: Error;
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
    tries: number = 0;
    gameLog: Array<GameLog> = [];
    constructor() {
        makeObservable(this, {
            hiddenNumber: observable,
            compareNumbersAndPushToGameLog: action,
        })
    }
    generateUniqueNumber() {
        this.hiddenNumber.splice(0,4);
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
    createLog(answer: number[]): GameLog {
        return {
            answer: Number(answer.join('')),
            bulls: 0,
            cows: 0,
            error: this.isValidAnswer(answer),
            tries: this.tries,
        }
    }
    compareNumbersAndPushToGameLog(answer: number[]) {
        this.tries++;
        const log: GameLog = this.createLog(answer);
        answer.forEach((numb, i) => {
            if (this.hiddenNumber.indexOf(numb) !== -1) {
                this.hiddenNumber.indexOf(numb) === i ? log.bulls++ : log.cows++;
            }
        })
        this.gameLog.push(log);
    }
    resetGameLog() {
        this.gameLog.splice(0, this.gameLog.length);
    }
    createResult() {
        const lastLog = this.gameLog[this.gameLog.length - 1]
        if (lastLog.error.isError) {
            return 'Invalid answer'
        }
        return `Bulls: ${lastLog.bulls}, Cows: ${lastLog.cows}`
    }
    isAnswerHasDuplicates(answer: number[]) {
        const result: boolean[] = [];
        answer.map((n, i) => {
            result.push(answer.includes(n, i + 1));
        })
        return result.includes(true);
    }
    isValidAnswer(answer: number[]): Error {
        if (answer.includes(NaN)) {
            return {
                isError: true,
                message: 'Invalid answer',
            };
        }
        if (answer.length < 4) {
            return {
                isError: true,
                    message: 'Invalid answer',
            }
        }
        if (this.isAnswerHasDuplicates(answer)) {
            return {
                isError: true,
                    message: 'The answer has a duplicates',
            }
        }
        return {
            isError: false,
            message: 'Valid answer',
        };
    }
    isWin() {
        return this.gameLog[this.gameLog.length - 1].bulls === 4
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
                        gameStore.gameLog.map((item, index) => <p key={index}>Answer: {item.answer}, {item.error.isError ? `Message: ${item.error.message}` : `Bulls: ${item.bulls}, Cows: ${item.cows}, Tries: ${item.tries}`}</p>)
                    }
                </div>
    )
}

const GameInterface = observer(() => {
    const [inputValue, setInputValue] = useState('');
    const [result, setResult] = useState('');
    const navigate = useNavigate();
    useEffect(() => {
        gameStore.generateUniqueNumber();
        gameStore.resetGameLog();
    }, [])
    const handleSubmit = () => {
        const answer = Array.from(inputValue, Number);
        gameStore.compareNumbersAndPushToGameLog(answer);
        setResult(gameStore.createResult())
        if (gameStore.isWin()) {
            navigate('/win');
        }
    }
    return (
        <div className={'gameWindow'}>
            <div className={'gameInterface'}>
                <img className={'image'} src={'../public/image.jpg'} alt={'bull&cow'}/>
                <div
                    className={'result'}
                >
                    {(result !== '') && result}
                </div>
                <input
                    className={'input'}
                    type={'text'}
                    maxLength={4}
                    minLength={4}
                    value={inputValue}
                    onChange={(event) => {
                        setResult('')
                        setInputValue(event.target.value)
                    }}
                />
                <button
                    onClick={handleSubmit}
                >
                    Answer
                </button>
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