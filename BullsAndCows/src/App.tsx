import {observer} from "mobx-react-lite";
import {action, makeObservable, observable} from "mobx";
import {useEffect, useState} from "react";
import './App.css'

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
        this.bulls = 0
        this.cows = 0
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
    isWin() {return this.bulls === 4}
}

const gameStore = new GameStore();
const WinWindow = () => {
    return (
        <div>
            <p>You win!</p>
            <button onClick={() => gameStore.generateUniqueNumber()}>
                New game
            </button>
        </div>
    )
}

const GameInterface = observer(() => {
    const [inputValue, setInputValue] = useState('');
    const [answer, setAnswer] = useState<number[]>([]);
    const [result, setResult] = useState('');

    useEffect(() => {
        answer.length !== 0 && setResult(gameStore.compareNumbers(answer))
    }, [answer])
    const handleSubmit = () => {
        setAnswer(Array.from(inputValue, Number));
    }
    return (
        <div className={'gameWindow'}>
            <img className={'image'} src={'../public/image.jpg'}/>
            {gameStore.hiddenNumber.length === 0
                ?
                    <button
                        onClick={() => {
                            gameStore.generateUniqueNumber()
                            setInputValue('')
                            setResult('')
                        }
                    }
                    >
                        Start
                    </button>
                :
                    <div className={'gameInterface'}>
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
                                className={'button'}
                                onClick={handleSubmit}
                            >
                                Answer
                            </button>
                            <p
                                className={'result'}
                            >{(result !== '') && result}</p>
                    </div>
            }
        </div>
    )
})

const App = observer(() => {
  return (
    <>
        {gameStore.bulls === 4 ? <WinWindow/> : <GameInterface/>}
    </>
  )
})

export default App