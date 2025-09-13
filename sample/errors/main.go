package main

import (
	"fmt"
	"errors"
)
// so majorly we have 3 things variable, err:= func_name()
// func func_name() (output,error){
// }  //- this also include error interface!  
// error package

func main(){
	x,y:=10,0
	if y==0{
		fmt.Println(errors.New("Cannot divide y by 0"))
	}else{
		fmt.Println(x/y)
	}
	// user, err:= getUser()
	// if err!=nil{
	// 	// write error using logic!
	// }

// }
// this error written is an error interface having Error() method defined in it! so we can have any type impleneting that method and we can have our 
// own customized error value!-  error interface!
// or we can use error package for our own customized error message we have errors.New("")

// func getUser() (User,error){}
	
}