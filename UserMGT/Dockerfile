FROM golang:1.19

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . .

# Run go mod tidy and go get to install dependencies
RUN go mod tidy
RUN go get

# Copy only the .go files into the container at /app
COPY *.go ./

# Build the Go application and name the binary as UserMGT
RUN go build -o /UserMGT

RUN chmod +x /UserMGT

# Expose port 8888
EXPOSE 8888

CMD [ "/UserMGT" ]
