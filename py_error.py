errorSep = '&'
class Error(Exception):

	def __init__(self, code, message, exception):
		self.code = code
		self.message = message
		self.exception = exception

	def __str__(self):
		#return str({'code': self.code, 'message': self.message, 'exception': self.exception})
		# new versiion
		return errorSep + str(self.code) + errorSep + str(self.message) + errorSep + str(self.exception)