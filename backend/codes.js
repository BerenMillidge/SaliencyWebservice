//All various codes here in this file, for easy changing

// RESPONSE_STATUSES
//let's actually put up the actual http response codes here
exports.CONTINUE = 100;
exports.SWITCHING_PROTOCOLS = 101; // server is changing protocols
exports.OK = 200;	//everythigni s fine, continue
exports.CREATED = 201; // i.e. resource was created
exports.ACCEPTED = 202; // request was accepted but server hasn't yet performed any actals
exports.NON_AUTHORITATVE_INFORMATION = 203; // information returned was not from server, but elsewhere
exports.NO_CONTENT = 204; // response contains no entity inside
exports.RESET_CONTENT = 205; // tells the browser to reset any stuff
exports.PARTIAL_CONTENT = 206;
exports.MULTIPLE_CHOICES = 300; // client has requested url which returns to multiple  resources
exports.MOVED_PERMANENTLY = 301; // url has been moved. send a link with this
exports.FOUND = 302; // has been found
exports.SEE_OTHER = 303; // should fetch resource using a different url
exports.NOT_MODIFIED = 304; // resource has not changed
exports.USE_PROXY = 305; // resource must be accessed through a proxy
// use 306 for something?
exports.TEMPORARY_REDIRECT = 307; // use the url to redirect;
exports.BAD_REQUEST = 400; // client has sent a bad request
exports.UNAUTHORISED = 401; // client has not done this. set appropriate eaders for authentication
exports.PAYMENT_REQUIRED = 402; // payment of some kind of needed for future use
exports.FORBIDDEN = 403; // access to this resource is forbidden by the server
exports.NOT_FOUND = 404;
exports.METHOD_NOT_ALLOWED = 405; // resource requested with disallowed http request - could be useful for api
exports.NOT_ACCEPTABLE = 406; // a method was allowed which is not acceptable.
exports.PROXY_AUTHENTICATION = 407; //server needs proxt authentication as well as normal
exports.REQUEST_TIMEOUT = 408; // client takes too long to complete request
exports.CONFLICT = 409; // the request is causing some kind of resource conflict
exports.GONE = 410; // server used to hold this resource, but doesn't anymore
exports.LENGTH_REQUIERD = 411; // need a content length header and doesn't have this
exports.PRECONDITION_FAILED = 412; // you failed some kind of conditional request
exports.REQUEST_ENTITY_TOO_LARGE = 413; // you sent too much data to the server
exports.REQUEST_URI_TOO_LONG = 414; // url is too long for server to process
exports.USUPPORTED_MEDIA_TYPE = 414; // server does not understant content type of client
exports.REQUESTED_RANGE_NOT_SATISFIABLE = 416; // range in header cannot be met
exports.EXPECTATION_FAILED = 417; // request contained an expectatoin in the expect request header which cannot be met with the server
exports.INTERNAL_SERVER_ERROR = 500;
exports.NOT_IMPLEMENTED = 501;
exports.BAD_GATEWAY = 502;
exports.SERVICE_UNAVAILABLE = 503; // server cannot serve requests
exports.GATEWAY_TIMEOUT = 504; // timeout from other gateway
exports.HTTP_VERSION_NOT_SUPPORTED = 505; // server received a version in request of protocol that it doesn't/won't suppot


//Image processing codes
exports.NO_IMAGES_FOUND=950;
exports.IMAGE_PROCESSING_ERROR = 951;

