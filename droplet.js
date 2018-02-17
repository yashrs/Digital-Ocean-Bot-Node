var digitalocean = require('digitalocean');
var client = digitalocean.client('19c329e7db37014ad235be7b1f919f3a6f7aa27f8a0dab2945320551eec3c7b1');
client.account.get(function(err, account) {
    console.log(err); // null on success
    console.log(account); //
});

function snap_shot() {
    client.droplets.list().then(function(droplets) {
        var droplet = droplets[0];
        return client.droplets.snapshot(droplet.id);
    }).then(function() {
        console.log("created a snapshot of a Droplet!");
    }).catch(function(err) {
        // Deal with an error
    });
}

function create_droplet_ubuntu(nam) {
    client.droplets.create({name:nam,region:"BLR1",size:"s-1vcpu-1gb",image:'ubuntu-16-04-x64'},function (object) {
        console.log(object);
        return object;

    });
}
function create_droplet_wordpress(nam)
{
    image_name = "wordpress-16-04";
    client.droplets.create({name:nam,region:"BLR1",size:"s-1vcpu-1gb",image: image_name},function (object) {
        console.log(object);
        return object;

    });

}
function create_droplet_wordpress(nam) {
    client.droplets.create({name:nam,region:"BLR1",size:"s-1vcpu-1gb",image:''},function (object) {
        console.log(object);
        return object;

    });
}




// function disp_droplets(id) {
//    client.droplets.get(id, function (object) {
//        console.log(object);
//     })
// }


