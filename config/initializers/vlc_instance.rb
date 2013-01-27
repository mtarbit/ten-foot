# The VideoFile model has a class attribute that holds a VLC::LibVLC
# instance which is slow to initialize (see the vlcrb gem). Referencing
# the model here forces the class to be auto-loaded up front. That way
# the cost is incurred now rather than later while the app is in use.
VideoFile
