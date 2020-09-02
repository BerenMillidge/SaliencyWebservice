# A script to rewrite the MIT saliency benchmark metrics in python

from __future__ import division
import numpy as np
import scipy

eps = 1e-8

def normalise_map(m):
	return (m - np.mean(m)) * 1. / np.std(m)

def correlation_coefficient(salmap, fixmap):
	#assert same shape , else resize
	if salmap.shape != fixmap.shape:
		salmap = scipy.misc.imresize(salmap, fixmap.shape)

	salmap = normalise_map(salmap)
	fixmap = normalise_map(fixmap)
	return scipy.stats.pearsonr(salmap, fixmap)

def info_gain(salienceMap, fixationMap, baselineMap):
	# finds the information gain of the saliency map over a baseline map
	if salienceMap.shape != fixationMap.shape:
		salienceMap = scipy.misc.imresize(salienceMap, fixationMap.shape)

	if baseline.shape != fixationMap.shape:
		baselineMap = scipy.misc.imresize(baselineMap, fixationMap.shape)

	# normalise arrays
	salienceMap = normalise_map(salienceMap)
	baselineMap = normalise_map(baselineMap)
	# vectorise the arrays!
	salienceMap = np.ndarray.flatten(salienceMap)
	baselineMap = np.ndarray.flatten(baselineMap)

	# normlise into probability distributions
	salienceMap = salienceMap * 1./np.sum(salienceMap)
	baselineMap = baselineMap * 1./np.sum(baselineMap)

	#  based on this paper: http://www.pnas.org/content/112/52/16054.abstract
	return np.mean(np.log2(eps + salienceMap) - np.log2(eps+baselineMap))


def KLdiv(salmap, fixmap):
	if salienceMap != fixationMap.shape:
		salmap = scipy.misc.imresize(salmap, fixationMap.shape)

	#normalise into distribution
	salmap = salmap / np.sum(salmap)
	fixmap = fixmap / np.sum(fixmap)

	#compute KL divergence
	return np.sum(fixmap * np.log2(eps + salmap / eps+fixmap))

def NSS(salmap, fixmap):
	if salmap.shape != fixmap.shape:
		salmap = scipy.misc.imresize(salmap, fixmap)

	salmap = normalise_map(salmap)
	h,w = salmap.shape
	total = 0
	N = 0
	for i in xrange(h):
		for j in xrange(w):
			if fixmap[i][j] != 0:
				total += salmap[i][j]
				N +=1

	return total/N

def least_squares(salmap, fixmap):
	if salmap.shape != fixmap.shape:
		salmap = scipy.misc.imresize(salmap, fixmap)

	salmap = normalise_map(salmap)
	fixmap = normalise_map(fixmap)

	return np.sum(np.square(salmap - fixmap))




