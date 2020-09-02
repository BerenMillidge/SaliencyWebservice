
import React from 'react';
import {ImageSlider} from './ImageSlider';
import './ImageDrop.css';
import ClipLoader from 'react-spinners';
import axios from 'axios'
import config from './config'
//import config from '../config';


const windowURL = window.URL || window.webkitURL;
const maxUploadSize = config.maxFileUploadSize || 1024*1024*255*3;
//const maxUploadSize =1024*1024*255*3;

const allowed_extensions = ['.jpg', '.jpeg','png'];
const allowedMIMETypes = ['image/jpeg', 'image/jpg', 'image/png'];

const submission_url = config.image_submission_url;

export class ImageDrop extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			files: [],
			box_state:0,
			hovered: false,
			preview_urls: []
		}
		//box state holds what states the box can be in for 
		//0 = no files currently. open to receiving files
		// 1 = files processing - show a spinner
		//2 = files processed. show preview or slider
		this.handleDrop = this.handleDrop.bind(this);
		this.handleDragLeave = this.handleDragLeave.bind(this);
		this.handleDragEnter = this.handleDragEnter.bind(this);
		this.handleDragOver = this.handleDragOver.bind(this);
		this.processFiles = this.processFiles.bind(this);
		this.releasePreviews = this.releasePreviews.bind(this);
		this.releaseFilePreview = this.releaseFilePreview.bind(this);
		this.makeFilePreview = this.makeFilePreview.bind(this);
		this.onSubmitClick = this.onSubmitClick.bind(this);

	}

	handleDragEnter(e){
		e.stopPropagation();
		e.preventDefault();
		this.setState({
			hovered: true
		})
	}
	handleDragOver(e){
		e.stopPropagation();
		e.preventDefault();
		this.setState({
			hovered: true
		})

	}
	handleDragLeave(e){
		e.stopPropagation();
		e.preventDefault();
		this.setState({
			hovered: false
		});
	}

	handleDrop(e){
		e.stopPropagation();
		e.preventDefault();
		const dt = e.dataTransfer;
		const files = dt.files;
		//convert files into an array of files
		var fileList = [];
		for (var i = 0; i<files.length; i++){
			fileList.push(files[i]);
		}
		this.processFiles(fileList);
	}

	handleFileInput(e){
		e.stopPropagation();
		console.log('file input being handled!')
		console.log(e);
	}

	makeFilePreview(file){
		//not sure if it needs anything else
		return windowURL.createObjectURL(file);
	}
	releaseFilePreview(e){
		e.stopPropagation();
		e.preventDefault();
		console.log(e);
		windowURL.revokeObjectURL(e.target.src); 
	}
	releasePreviews(){
		//just loops throguh all previews in the component, releasing them
		for (var i =0; i<this.state.previews.length; i++){
			windowURL.revokeObjectURL(this.state.previews[i]);
		};
	}
	componentWillUnmount(){
		// for now and just release the previews
		this.releasePreviews();
	}

	processFiles(files){
		console.log('in process files function')
		console.log(files);
		//begin processing files
		this.setState({
			box_state: 1
		});
		var processedFiles = [...this.state.files] ||[];
		var previews = [...this.state.preview_urls] || [];
		var errors = [];
		for (var i = 0; i<files.length; i++){
			const file = files[i];
			const reader = new FileReader();
			reader.onload = (res) =>{
				//do some validation of types and MIME types here

				//do validations on the size
				const maximumUploadSize = this.props.maxUploadSize || maxUploadSize;
				if(file.size > maximumUploadSize){
					console.log('file greater than the maximum. abort');
					const err = {
						code: 999,
						message: 'File: ' + file.name + 'is greater than the maximum allowed size'
					}
					reader.abort(err);
				}
				//do validation on the type
				const payload = {
				name: file.name,
				type: file.type,
				size: file.size,
				last_modified: file.last_modified,
				data: res.target.result
				}
				processedFiles.push(payload);
				//make a preview
				previews.push(this.makeFilePreview(file));
				//check condition to see if update
				const properLength = files.length + this.state.files.length;
				if(processedFiles.length === properLength){
					//then it is the final file so can update
					console.log('file processing complete');
					console.log(processedFiles);
					this.setState({
						box_state: 2,
						files: processedFiles,
						preview_urls: previews,
						hovered: false
					})
				}
				console.log(processedFiles);
			}
			reader.onerror = (err)=>{
				console.log('error encountered in file reader');
				console.log(err);
				errors.push(err);
			}
			reader.onabort = (err)=>{
				console.log('file reader aborted');
				console.log(err);
				errors.push(err);
			}
			reader.readAsDataURL(file);

		}

	}

	onSubmitClick(e){
		e.stopPropagation()
		console.log('SUBMIT BUTTON CLICKED')
		const boundThis = this;
		axios.post(submission_url, {
			files: this.state.files
		}).then(function(response){
			console.log('Response is a success!');
			const imgs = response.salience_maps;
			boundThis.setState({
				preview_urls: imgs
			});
		}).catch(function(err){
			console.log('Error encountered')
			boundThis.setState({
				box_state: 5
			});
			console.log(err)
		});
	}



	render(){
		console.log('in render');
		console.log(this.state.box_state);
		var containerClass = "image-drop-container";
		var sliderContainerClass = "drop-box-slider";
		if(this.state.hovered){
			//this should allow to alter everything for hover classes
			containerClass = "image-drop-container-hovered image-drop-container";
			sliderContainerClass = "drop-box-slider-hovered drop-box-slider";
		}
		if(this.state.box_state===0){
			return (
				<div className={containerClass}>
				<form className="drop-box" encType="multipart/form-data" onDragEnter={this.handleDragEnter} onDragOver={this.handleDragOver} onDrop={this.handleDrop} onDragLeave={this.handleDragLeave}>
					<input type="file" className="drop-box-input-id" id="click-input">
					</input>
					<div className="drop-text-container">
						{this.state.hovered ===true && 
						<div className="drop-box-icon-container fa fa-lg">
							<i className="drop-box-icon fa fa-upload fa-lg icon-large icon-3x fa-4x"/>
						</div>
						}
						{this.state.hovered ===false&&
						<div className="drop-box-text">
							Drop the images you would like here or click to upload;
						</div>
						}
					</div>
				</form>
				</div>
				)

		}
		if(this.state.box_state===1){
			//so this it is processing, return just a spinner
			return (
				<div className={containerClass}>
					<div className="drop-box-spinner fa fa-spinner fa-spin">
						Spinner placeholder!
					</div>
				</div>
				)
		}
		if(this.state.box_state===2){
			//now if it's uploading use the image slider
			return (
				<div className="image-drop-container">
				<form className="drop-box" enctype="multipart/form-data" onDragEnter={this.handleDragEnter} onDragOver={this.handleDragOver} onDrop={this.handleDrop} onDragLeave={this.handleDragLeave}>
						<input type="file" className="drop-box-input-id" id="click-input" onClick={this.handleFileInput}>
						</input>
						<div className={sliderContainerClass}>
								<ImageSlider urls={this.state.preview_urls}/>
								{this.state.hovered===true &&
								<div className="drop-text-container">
									<div className="drop-box-slider-text drop-box-text ">
										<i className="drop-box-icon fa fa-upload fa-lg fa-4x"/>
									</div> 
								</div>
							}
						</div>
					</form>
				<div className="image-submit-button" onClick={this.onSubmitClick}>
					Submit image!
				</div>

				</div>

				)
		}
		if (this.state.box_state===5){
			return (
				<div className="error-message">
				Error encountered.
				</div>
				)
		}
	}
}

export default ImageDrop;