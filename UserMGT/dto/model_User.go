package dto

import "time"

type User struct {
	UserId      string    `json:"UserId" bson:"userid" validate:"required"`
	FirstName   string    `json:"FirstName" bson:"firstname" validate:"required"`
	LastName    string    `json:"LastName" bson:"lastname" validate:"required"`
	Email       string    `json:"Email" bson:"email" validate:"required,email"`
	Username    string    `json:"Username" bson:"username" validate:"required"`
	Password    string    `json:"Password" bson:"password" validate:"required,min=6"`
	Age         int       `json:"Age" bson:"age" validate:"gte=0,lte=120"`
	Gender      string    `json:"Gender" bson:"gender" validate:"required"`
	Country     string    `json:"Country" bson:"country"`
	PhoneNumber string    `json:"PhoneNumber" bson:"phonenumber"`
	Role        string    `json:"Role" bson:"role"`
	IsVerified  bool      `json:"IsVerified" bson:"isverified"`
	CreatedAt   time.Time `json:"CreatedAt" bson:"createdat"`
	UpdatedAt   time.Time `json:"UpdatedAt" bson:"updatedat"`
	Deleted     bool      `json:"Deleted" bson:"deleted"`
}

type LoginRequest struct {
	Email    string `json:"Email" validate:"required,email"`
	Password string `json:"Password" validate:"required"`
}
