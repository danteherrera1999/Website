import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
import pyautogui as pag
import win32api

points = [[-.5,0],
          [-.5,1],
          [.5,1],
          [.5,0]]
points = np.array(points)
t = np.linspace(0,1,1000)
spline = lambda a,b,c,d: np.array([a[0] * (1 - 3 * t + 3 * t ** 2 - t ** 3) + b[0] * (3*t - 6 * t ** 2 + 3 * t ** 3) + c[0] * (3 * t ** 2 - 3 * t ** 3) + d[0] * t ** 3,
                            a[1] * (1 - 3 * t + 3 * t ** 2 - t ** 3) + b[1] * (3*t - 6 * t ** 2 + 3 * t ** 3) + c[1] * (3 * t ** 2 - 3 * t ** 3) + d[1] * t ** 3])
pad = .05
os = [7,112]
# SET ENVIRONMENT
dpi = 96
fig, ax = plt.subplots(figsize=(900/dpi,900/dpi))
w, h = fig.canvas.get_width_height()
mngr = plt.get_current_fig_manager()

# to put it into the upper left corner for example:
mngr.window.wm_geometry("+%d+%d" % (0, 0))

lines = [plt.plot(*points.T,'ro')[0],plt.plot(*points.T,'--')[0],plt.plot(*spline(*points))[0]]
mag = lambda a,b : np.sqrt(np.sum((b-a)**2))
def update(i):
    global points

    #Mouse stuff
    if win32api.GetKeyState(0x01) < 0:
        pos = ax.transData.inverted().transform((np.array([0, 1080]) - np.array(pag.position())) * np.array([-1, 1]) - os)
        ind = np.argmin([mag(pos,point) for point in points])
        if mag(points[ind],pos) <= pad:
            points[ind] = pos

    lines[0].set_data(*points.T)
    lines[1].set_data(*points.T)
    lines[2].set_data(*spline(*points))
    return lines


myAnimation = FuncAnimation(fig, update, frames=500, interval=1, blit=True, repeat=True)


plt.show()