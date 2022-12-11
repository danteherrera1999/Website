import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits import mplot3d
from random import randint
from matplotlib.animation import FuncAnimation
import pyautogui as pag
# position will be defined as theta and phi

# Mouse positioning stuff
y_scale = 30/1080 #degrees per pixel
x_scale = 30/1920
pos_calc = lambda x,y: [(-1920/2 + x) * x_scale, (-1080/2 + y) * y_scale]

s = lambda theta: np.sin(theta)
c = lambda theta: np.cos(theta)
T1 = lambda theta: np.array([[c(theta),0,-s(theta)],
                             [0,1,0],
                             [s(theta),0,c(theta)]])
T2 = lambda phi: np.array([[1,0,0],
                           [0,c(phi),-s(phi)],
                           [0,s(phi),c(phi)]])




T_G_2_I = lambda theta, phi: np.matmul(T1(theta),T2(phi))
T_I_2_G = lambda theta, phi: T_G_2_I.T
d2r = np.pi / 180
r2d = 180 / np.pi
mag = lambda vec: np.sqrt(np.sum(vec.astype(float) ** 2))

# plot cylinder
T_cyl_to_cart = lambda t, r: np.array([[r*c(t),0,0],
                                        [0,r*s(t),0],
                                        [0,0,1]])
T_cyl_to_cart_2d = lambda t, r, z: np.array([r * c(t),r * s(t), z])

def update_pos():
    phi_d, roll_d = pos_calc(*pag.position())
    return roll_d, phi_d

def cyl_dat(radius,height_z):
    z = np.linspace(0, height_z, 10)
    theta = np.linspace(0, 2*np.pi, 10)
    theta_grid, z_grid = np.meshgrid(theta, z)
    x_grid = radius*np.cos(theta_grid)
    y_grid = radius*np.sin(theta_grid)
    return x_grid,y_grid,z_grid

def func(roll_d,pitch_d,R,h_z):
    # Plane
    plt.clf()
    theta_d = pitch_d
    phi_d = -1 * roll_d
    theta = theta_d * np.pi / 180
    phi = phi_d * np.pi / 180

    X_p,Y_p = np.meshgrid(np.linspace(-5,5,2),np.linspace(-5,5,2))
    Z_p = np.zeros((2,2))

    h_z *= -1

    # FIX POINTS
    P1 = np.matmul(T_G_2_I(theta,phi),T_cyl_to_cart_2d(0,R,-5))
    P2 = np.matmul(T_G_2_I(theta,phi),T_cyl_to_cart_2d(2 * np.pi / 3,R,-5))
    P3 = np.matmul(T_G_2_I(theta,phi),T_cyl_to_cart_2d(4 * np.pi / 3,R,-5))
    fixpoints = [P1,P2,P3]
    fixpoints_base = [T_cyl_to_cart_2d(0,3,0),T_cyl_to_cart_2d(2 * np.pi / 3,3,0),T_cyl_to_cart_2d(4 * np.pi / 3,3,0)]
    fixpoints = fixpoints + fixpoints_base
    member_1 = np.array([fixpoints[0],fixpoints_base[0]])
    member_2 = np.array([fixpoints[1],fixpoints_base[1]])
    member_3 = np.array([fixpoints[2],fixpoints_base[2]])

    members = [member_1,member_2,member_3]

    ax = fig.add_subplot(111, projection='3d')
    ax.plot_surface(X_p, Y_p, Z_p,alpha=.75)
    Xc,Yc,Zc = cyl_dat(R,h_z)
    Xc_t,Yc_t,Zc_t = np.zeros((10,10)),np.zeros((10,10)),np.zeros((10,10))
    plt.title(r"First Iteration Gimbal Design $\theta=$"+str(int(100*theta_d)/100)+r" $\phi=$"+str(int(100*phi_d)/100))
    for i in range(10):
        for k in range(10):
            Xc_t[i,k],Yc_t[i,k],Zc_t[i,k] = np.matmul(T_G_2_I(theta,phi),np.array([Xc[i,k],Yc[i,k],Zc[i,k]]))
    for point in fixpoints:
        ax.scatter(*point,"ro",c="k")
    for i in range(len(members)):
        ax.plot(members[i][0:,0], members[i][0:,1], members[i][0:,2],label=f"L{i+1}: {int(100*mag(members[i][1]-members[i][0]))/100}")
    ax.plot_surface(Xc_t, Yc_t, Zc_t, alpha=0.5)
    ax.set_xlabel("x")
    ax.set_ylabel("y")
    ax.set_zlabel("z")
    plt.legend(loc=3)

# plots gimballed cylinder with parameters [theta,phi,radius,height (positive) ]
# theta is the second euler angle (y axis)
# phi is the 1st euler angle (x axis)
# Transform is 2 --> 1
fig = plt.gcf()
def animate(i):
    func(*update_pos(),1,10)

ani = FuncAnimation(fig,animate)

plt.show()