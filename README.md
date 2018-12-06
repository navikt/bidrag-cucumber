# cucumber-js image

Build the image by 
```
$ npm install
$ docker build -t bidrag-dokument-cucumber .
```

Run the image by mapping /cucumber to your cucumber directory containing features and step definitions.

```
$ docker run -it --rm -v `pwd`/cucumber:/cucumber bidrag-dokument-cucumber
```
