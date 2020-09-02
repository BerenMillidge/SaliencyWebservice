import React from 'react';
import './ImageSlider.css';

export class ImageSlider extends React.Component {
	constructor(props){
		super(props);
		this.state={
			index: this.props.urls.length-1 || 0,
			hovered: false
		};
		this.slideLeft = this.slideLeft.bind(this);
		this.slideRight = this.slideRight.bind(this);
		this.onMouseEnter = this.onMouseEnter.bind(this);
		this.onMouseLeave = this.onMouseLeave.bind(this);
		this.handleRemoveClick = this.handleRemoveClick.bind(this);
		this.showRemoveButton = this.showRemoveButton.bind(this);
	}

	slideLeft(e){
		e.stopPropagation();
		e.preventDefault();
		if(this.state.index <=0){
			this.setState({
				index: this.props.urls.length - 1
			});
		} 
		if(this.state.index !==0){
			this.setState({
				index: this.state.index -1
			});
		}
	}
	slideRight(e){
		e.stopPropagation();
		e.preventDefault();
		if(this.state.index >=this.props.urls.length -1){
			this.setState({
				index: 0
			});
		}
		if(this.state.index < this.props.urls.length -1){
			this.setState({
				index: this.state.index +1
			});
		}
	}

	onMouseEnter(e){
		e.preventDefault();
		e.stopPropagation();
		this.setState({
			hovered: true
		});
	}
	onMouseLeave(e){
		e.preventDefault();
		e.stopPropagation();
		this.setState({
			hovered: false
		});
	}

	handleRemoveClick(e){
		e.preventDefault();
		e.stopPropagation();
		console.log('in handle remove click');
		//fire the props function
		this.props.removeFunc(this.state.index);
	}
	showRemoveButton(){
		if(this.state.hovered && typeof(this.props.removeFunc==='function')){
			return true;
		}
		return false;
	}


	render(){
		console.log('in image slider render');
		//check to make sure index is correctly set
		if(this.state.index > this.props.urls.length-1){
			this.setState({
				index: this.props.urls.length-1
			});
		}
		const url = this.props.urls[this.state.index];
		const showRemove = this.showRemoveButton();
		console.log('show_remove: ' + showRemove);
		return (
			<div className="image-slider-container" onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
				<div className="image-slider-img">
					<img src={url} alt={url} className="image-slider-img-i"/>
				</div>
				{this.props.urls.length >1 &&
				<div>
				<div className="image-slider-left-arrow" onClick={this.slideLeft}>
					<div className="image-slider-arrow">
						<i className="fa fa-angle-left fa-3x"/>
					</div>
				</div>
				<div className="image-slider-right-arrow" onClick={this.slideLeft}>
					<div className="image-slider-arrow">
						<i className="fa fa-angle-right fa-3x"/>
					</div>
				</div>
			</div>
			}
			{showRemove &&
			<div className="remove-button" onClick={this.handleRemoveClick}>
					<i className="fa fa-times fa-2x"/>
			</div>
				}
			</div>
			)
	}
}
export default ImageSlider;