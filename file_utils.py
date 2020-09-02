import numpy as np
import cPickle as pickle
import scipy

def load_image_file(filename):
	if not isinstance(filename, str):
		return Error(2, 'Filename should be a string', 0), None
	fd = img.split('.')[-1]
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
