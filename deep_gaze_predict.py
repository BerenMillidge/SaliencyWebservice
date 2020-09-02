# core script to use the deep gaze model to predict when called
from __future__ import division
import numpy as np
from scipy.ndimage import zoom
from scipy.misc import logsumexp
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns
import tensorflow as tf
import sys
import os
from py_error import Error
import scipy
import cPickle as pickle
# also import skimage
import skimage 
import json

# load the model path
path_correct = '../'
model_path = path_correct + 'models/deep_gaze/'
print("in python script!")
# print the current directory
print("current directory", os.getcwd())

# get the template
centerbias_template = np.load(model_path + 'centerbias.npy')

# initialise the tensorflow session
tf.reset_default_graph()
check_point = model_path + 'DeepGazeII.ckpt'
new_saver = tf.train.import_meta_graph('{}.meta'.format(check_point))
input_tensor = tf.get_collection('input_tensor')[0]
centerbias_tensor = tf.get_collection('centerbias_tensor')[0]
log_density = tf.get_collection('log_density')[0]
log_density_wo_centerbias = tf.get_collection('log_density')[0]
log_density_wo_centerbias = tf.get_collection('log_density_wo_centerbias')[0]

# create the session and restore
sess = tf.Session()
new_saver.restore(sess, check_point)

supported_file_types = ['jpg','jpeg', 'png']
predict_command =  'predict'
split_character = '$%**&'
exit_command = 'exit!'
required_image_size = (768, 1024, 3)
base_image_path = path_correct + 'salmaps/'
base_save_path = path_correct + 'images/' 

def pickle_load(fname):
	return pickle.load(open(fname, 'rb'))

def normalize_image(img):
	return img - np.mean(img) / np.std(img)

def preprocess_image(img):
	# preprocess to be the same size as the image
	return scipy.misc.imresize(img, required_image_size)

def postprocess_image(img):
	return img

def predict(img):
	img = preprocess_image(img)
	shape  = img.shape
	centerbias = zoom(centerbias_template, (shape[0]/1024, shape[1]/1024), order=0, mode='nearest')
	centerbias -= logsumexp(centerbias)
	image_data = img[np.newaxis, :,:,:]
	centerbias_data = centerbias[np.newaxis, :,:,np.newaxis]
	# make prediction
	log_density_prediction = sess.run(log_density, {
		input_tensor: image_data,
		centerbias_tensor: centerbias_data,
		#centerbias_tensor: np.zeros(centerbias_data.shape)
		})
	return log_density_prediction

# plotting functionality if needed
def plot_density(img,pred):
	plt.gca().imshow(img, alpha=0.2)
	m = plt.gca().matshow(np.exp(pred[0,:,:,0]), alpha=0.5, cmap='RdBu')
	plt.colorbar(m)
	plt.title('density_prediction')
	plt.axis('off')
	return m.get_figure()

def plot_log_density(img, pred):
	plt.gca().imshow(img, alpha=0.2)
	m = plt.gca().matshow((pred[0,:,:,0]), alpha=0.5, cmap='RdBu')
	plt.colorbar(m)
	plt.title('log density prediction')
	plt.axis('off')
	return m.get_figure()

def load_image_file(filename):
	if not isinstance(filename, str):
		return Error(2, 'Filename should be a string', 0), None
	fd = filename.split('.')[-1]
	if fd == 'npy':
		try:
			img = np.load(filename)
			return None, img
		except Exception as e:
			return Error(1, "Error in loading image file", str(e)), None
	if fd in supported_file_types:
		try:
			img = scipy.imread(filename)
			return None, img
		except Exception as e:
			return Error(1, "Error in loading image file", str(e)), None
	else:
		try:
			img = pickle_load(filename)
			return None, img
		except Exception as e:
			return Error(1, "Error in loading image file", str(e)), None

def predict_save_saliency(filename, save_name, save_path):
	err, img = load_image_file(filename)
	if err is not None:
		return err,None

	#then preprocess
	err, prep = preprocess_image(img)
	if err is not None:
		return err, None
	pred = predict(prep)
	post = postprocess_image(pred)
	plot = plot_density(img, post)
	plot.savefig(save_path + save_name)
	return "Success!"

def main():
	#base_image_path = sys.argv[1]
	#base_save_path = sys.argv[2]

	openToInput = True
	while openToInput == True:
		received = raw_input()
		# split based on split
		print("in python received command ", received)
		command, fname = received.split(split_character)
		if command == predict_command:
			err, result = predict_save_saliency(base_image_path + fname, fname, base_save_path)
			if err is not None:
				print(err)
			else:
				print(result)

		if command == exit_command:
			print("Python process exiting")
			openToInput = False


def test_image(val=21):
	imgs = pickle_load(path_correct + 'test_images')
	img = scipy.misc.face()
	img = imgs[val]



if __name__ == '__main__':
	#err, res = main()
	#pred, plot = res
	#print pred.shape
	#print type(plot)
	#plt.imshow(np.reshape(pred, (768,1024)))
	#plt.show()
	#plt.show(plot)
	main()
	



