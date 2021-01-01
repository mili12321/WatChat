import React from 'react'
import { IoIosVolumeLow, IoIosThumbsUp } from 'react-icons/io'
import uuid from 'react-uuid'
import { ReactionPicker } from './ReactionPicker'
import { socketService } from '../services/socketService'

export class VideoControls extends React.Component {
  state = {
    showVolume: false,
    showReactions: false,
    reactions: [],
    reactionIds: [],
  }

  componentDidMount() {
    socketService.on('reactions', (reaction) => {
      this.setState({ reactions: [...this.state.reactions, reaction] })
    })
    socketService.on('reaction-delete', (id) => {
      this.removeReaction(id)
    })
  } 

  componentWillUnmount(){
    this.setState({ reactions:[] })
  }

  onSelectReaction = (type) => {
    const newReaction = { id: uuid(), type, posX:this.getRandomNum(5, 8)}
    this.setState({ reactions: [...this.state.reactions, newReaction] })
    socketService.emit('reactions', newReaction)
    setTimeout(() => {
      socketService.emit('reaction-delete', newReaction.id)
    }, 2000)
    this.removeReaction(newReaction.id)
  }

  getRandomNum = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  removeReaction = (id) => {
    let reactions = this.state.reactions
    reactions = reactions.filter((reaction) => reaction.id !== id)
    this.setState({ reactions })
  }

  onToggleReactions = () => {
    this.setState({ showReactions: !this.state.showReactions })
  }

  hideReactions = () => {
    this.setState({ showReactions: false })
  }

  changeVolume = (ev) => {
    this.props.onVolumeChange(ev.target.value)
  }

  onVolumeToggle = () => {
    this.setState({ showVolume: !this.state.showVolume })
  }

  hideVolume = () => {
    this.setState({ showVolume: false })
  }

  render() {
    return (
      <div className={`control-panel ${this.props.fullScreenControlPanel()}`}>
        <div className='reactions' onClick={this.onToggleReactions}>
          <div
            className={`reactions-container ${
              this.state.showReactions ? '' : 'hidden'
            }`}>
            <ReactionPicker
              hideReactions={this.hideReactions}
              onSelectReaction={this.onSelectReaction}
            />
          </div>

          <IoIosThumbsUp style={{ width: '70%', height: '70%' }} />
        </div>

       
        <div onClick={this.props.onTogglePlay} className="movie-play-btn">
        {this.props.isPlaying?<i className="fas fa-grip-lines-vertical"></i>:<i className="fas fa-play"></i>}
        </div>

        <div className='volume' onClick={this.onVolumeToggle}>
          <input
            type='range'
            id='volume'
            className={this.state.showVolume ? '' : 'hidden'}
            name='volume'
            min='0'
            max='1'
            step='0.01'
            value={this.props.volume}
            onChange={this.changeVolume}></input>
          <IoIosVolumeLow style={{ width: '100%', height: '100%' }} />
        </div>
        
        <div onClick={this.props.toggleFullScreen} className="full-sceen-btn">
          {!this.props.isFullScreen&&<i className="fas fa-expand-arrows-alt"></i>}
          {this.props.isFullScreen&&<i className="fas fa-compress-arrows-alt"></i>}
        </div>

        {this.state.reactions.map((reaction) => (
          <div
            style={{ right: `${reaction.posX}%` }}
            key={reaction.id}
            className={`reaction-animation ${reaction.type}`}></div>
        ))}
      </div>
    )
  }
}