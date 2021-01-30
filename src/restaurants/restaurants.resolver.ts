import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CreateRestaurantDto } from "./dtos/create-restaurant.dto";
import { Restaurant } from "./entities/restaurant.entity";
import { RestaurantService } from "./restaurants.service";

@Resolver(of => Restaurant)
export class RestaurantResolver{
    constructor(private readonly RestaurantService:RestaurantService){}
    @Query(returns => [Restaurant])
    restaurants():Promise<Restaurant[]>{
        return this.RestaurantService.getAll();
    }
    @Mutation(returns => Boolean)
    createRestaurant(@Args() createRestaurantDto: CreateRestaurantDto): boolean{
        return true;
    }
}