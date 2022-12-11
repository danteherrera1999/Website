import numpy as np
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

def func(roll_d,pitch_d):
    # Plane
    R = 1
    theta_d = pitch_d
    phi_d = -1 * roll_d
    theta = theta_d * np.pi / 180
    phi = phi_d * np.pi / 180


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
    Ls = [np.sqrt(np.dot(member[1]-member[0],member[1]-member[0])) for member in members]
    print(Ls)

while True:
    func(*update_pos())
