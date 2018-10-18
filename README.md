# cucumber-js image

Build the image by 
```
$ docker build -t bidrag-cucumber .
```

Run the image by mapping /features to your directory containing features and step definitions.

```
$ docker run -it --rm -v `pwd`/features:/features bidrag-cucumber
```
