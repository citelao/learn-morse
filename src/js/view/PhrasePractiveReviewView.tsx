import React from "react";
import MainView from "./MainView";
import { IGuess } from "../LessonPlan";
import levenshtein from "js-levenshtein";

export interface PhrasePracticeReviewViewProperties {
    phrase: string[];
    guess: string[];

    onBegin: () => void;
}

export default class PhrasePracticeReviewView extends React.Component<
    PhrasePracticeReviewViewProperties
> {
    constructor(props: PhrasePracticeReviewViewProperties) {
        super(props);
    }

    render() {
        // // Generate dash strings for remaining phrases:
        // const guesses = this.state.currentGuess.split(" ");

        // // Don't print the one we are still typing:
        // guesses.pop();

        // console.log(guesses);
        // const guessHistory = this.props.phrase.map(
        //     (word, index): IGuess => {
        //         return {
        //             guess: guesses[index]
        //                 ? guesses[index].split("").join(" ")
        //                 : "_ _ _ _ _"
        //         };
        //     }
        // );

        return (
            <section className="main">
                <h1>Review</h1>
                <button onClick={this.handleBegin} className="startButton">
                    Continue!
                </button>
            </section>
        );
    }

    private handleBegin = () => {
        this.props.onBegin();
    }
}
