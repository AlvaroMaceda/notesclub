import * as React from 'react'
import { Form, Button } from 'react-bootstrap'
import KeyWordTransformationExercise from './KeyWordTransformationExercise'
import { humanize } from './stringTools'
import '@ionic/react/css/core.css';

import { IonIcon, IonDatetime } from '@ionic/react';
import { addCircleOutline, removeCircleOutline } from 'ionicons/icons'

interface IProps {
  createExercise: Function
  updateAlert: Function
}

interface IState {
  title: string
  description: string
  originalSentence: string
  word: string
  part1: string
  part2: string
  solutions: string[]

  showPreview: boolean
}

class KeyWordTransformationCreator extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      title: "Key Word Transformation",
      description: "Write a second sentence so that it has a similar meaning to the first sentence, using the word given. Do not change the word given. You must use between three and six words, including the word given.",
      originalSentence: "",
      word: "",
      part1: "",
      part2: "",
      solutions: [""],

      showPreview: false
    }
  }

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target
    const value = target.value
    const name = target.name

    this.setState((prevState) => ({
      ...prevState,
      [name]: value
    }))
  }

  renderInput = (fieldName: string) => {
    const value = eval("this.state." + fieldName) // Is there sth like "send" from ruby so we don't need to use eval?
    return (
      <Form.Group>
        <Form.Label className="label-creator">{humanize(fieldName)}:</Form.Label>
        <Form.Control
          type="text"
          value={value}
          name={fieldName}
          onChange={this.handleChange as any} />
      </Form.Group>
    )
  }


  renderTextArea = (fieldName: string) => {
    const value = eval("this.state." + fieldName) // Is there sth like "send" from ruby so we don't need to use eval?
    return (
      <Form.Group>
        <Form.Label>{humanize(fieldName)}:</Form.Label>
        <Form.Control
          as="textarea"
          value={value}
          name={fieldName}
          onChange={this.handleChange as any} />
      </Form.Group>
    )
  }

  addSolution = () => {
    this.setState({ solutions: this.state.solutions.concat([""]) })
  }

  removeSolution = () => {
    let solutions = this.state.solutions
    if(solutions.length > 1){
      solutions.pop()
      this.setState({ solutions: solutions })
    }else{
      this.props.updateAlert("danger", "You must have at least one solution.")
    }
  }

  renderSolutions = () => {
    const { solutions } = this.state
    const renderedSolutions = solutions.map((solution, index) => this.renderSolution(solution, index))
    return (
      <>
        { renderedSolutions }
        <IonIcon onClick={this.addSolution} icon={addCircleOutline} size="large" />
        <IonIcon onClick={this.removeSolution} icon={removeCircleOutline} size="large" />
      </>
    )
  }

  handleSolutionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target
    const value = target.value
    const index = Number(target.name.split("_")[1])
    const { solutions } = this.state
    solutions[index] = value
    this.setState({ solutions: solutions })
  }

  renderSolution = (solution: string, index: number) => {
    return (
      <Form.Group key={"solution_" + String(index)}>
        <Form.Label>{"Solution " + String(index + 1) + ":"}</Form.Label>
        <Form.Control
          type="text"
          value={solution}
          name={"solution_" + String(index)}
          onChange={this.handleSolutionChange as any} />
      </Form.Group>
    )
  }

  create = () => {
    const { title, description, originalSentence, part1, word, part2, solutions } = this.state

    const data = {
      title: title,
      description: description,
      originalSentence: originalSentence,
      part1: part1,
      word: word,
      part2: part2,
      solutions: solutions
    }
    const json_data = JSON.stringify(data)
    this.props.createExercise("KeyWordTransformation", json_data)
  }

  togglePreview = () => {
    this.setState({ showPreview: !this.state.showPreview })
  }

  public render() {
    const { title, description, originalSentence, part1, word, part2, solutions, showPreview } = this.state

    return (
      <>
        <div className="exercise container">
          <div className="row">
            <div className="col-lg-3"></div>
            <div className="col-lg-6">
              {this.renderInput("title")}
              {this.renderTextArea("description")}
              {this.renderInput("originalSentence")}
              {this.renderInput("word")}
              {this.renderInput("part1")}
              {this.renderInput("part2")}
              {this.renderSolutions()}
              <div>
                <Button onClick={this.create}>Create</Button>
              </div>
            </div>
            <div className="col-lg-3"></div>
          </div>
        </div>
        <div className="preview text-center">
          <Button onClick={this.togglePreview} variant="link">{showPreview ? "Hide" : "Show"} preview</Button>
          {showPreview ? <KeyWordTransformationExercise title={title} description={description} word={word} part1={part1} part2={part2} solutions={solutions} originalSentence = {originalSentence}/> : <></>}
        </div>
      </>
    )
  }
}

export default KeyWordTransformationCreator
