import {observer} from "mobx-react-lite";
import {action, makeObservable, observable} from "mobx";
import {useEffect, useState} from "react";
import './App.css'
import {createBrowserRouter, Link, RouterProvider, useNavigate} from "react-router-dom";

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
        answer.forEach((numb, i) => {
            if (this.hiddenNumber.indexOf(numb) !== -1) {
                this.hiddenNumber.indexOf(numb) === i ? this.bulls++ : this.cows++;
            }
        })
        return `Your answer has ${this.bulls} bull(s) and ${this.cows} cow(s)!`
    }
    resetCount() {
        this.bulls = 0;
        this.cows = 0;
    }
}

const gameStore = new GameStore();

const StartWindow = () => {
    return (
        <Link
            to={'/game'}
        >
            Start
        </Link>
    )
}

const GameInterface = observer(() => {
    const [inputValue, setInputValue] = useState('');
    const [result, setResult] = useState('');
    const navigate = useNavigate()
    useEffect(() => gameStore.generateUniqueNumber(), [])
    const handleSubmit = () => {
        const answer = Array.from(inputValue, Number);
        if (answer.length !== 0) setResult(gameStore.compareNumbers(answer));
        if (gameStore.bulls === 4) {
            navigate('/win');
        }
    }
    return (
        <div className={'gameInterface'}>
            <img className={'image'} src={'../public/image.jpg'} alt={'bull&cow'}/>
            <input
                className={'input'}
                type={'text'}
                maxLength={4}
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
    )
})

const WinWindow = () => {
    return (
        <div>
            <h1 className={'win'}>You win!</h1>
            <Link to={'/game'}>
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