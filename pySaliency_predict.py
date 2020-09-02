import numpy as np
import models.pySaliencyMap.pySaliencyMap as sm
import scipy

supported_file_types = ['jpg','jpeg', 'png']
predict_command =  'predict'
split_character = '$%**&'
exit_command = 'exit!'

def preprocess_image(img):
	return img

def postprocess_image(img):
	return img

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


def predict_pysaliency(fname, save_path):
	img = load_image_file(fname)
	h,w = img.shape
	smodel = sm(h,w)
	salmap = smodel.SMGetSm(img)
	#binarized_map = smodel.SMGetBinarizedSM(img)
	#salient_region = smodel.SMGetSalientRegion(img)
	f = plt.subplot(2,2,2)
	plt.imshow(salmap, cmap='RdBu')
	plt.title('Saliency map')
	f.get_figure()
	f.savefig(save_path)
	return None, "Success!"



def main():
	openToInput = True
	while openToInput == True:
		received = raw_input()
		# split based on split
		command, fname = received.split(split_character)
		if command == predict_command:
			err, result = predict_pysaliency(base_image_path + fname, fname, base_save_path)
			if err is not None:
				print err
			else:
				print result

		if command == exit_command:
			print "Python process exiting"
			openToInput = False

if __name__ =='__main__':
	main()